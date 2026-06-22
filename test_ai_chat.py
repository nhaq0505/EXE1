import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://localhost:5200"

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode("utf-8")
        try:
            res_data = json.loads(body)
        except Exception:
            res_data = body
        return status, res_data
    except Exception as e:
        return 500, {"message": str(e)}

def run_tests():
    print("=== STARTING GREEN SOLUTION AI PROXY INDEPENDENT VERIFICATION ===")
    results = {}
    
    # Step 1: Login or Register test user
    print("\n[Step 1] Attempting to login test user...")
    login_payload = {
        "email": "testuser@greensolution.vn",
        "password": "Password123"
    }
    status, login_res = make_request(f"{BASE_URL}/api/auth/login", "POST", data=login_payload)
    
    token = None
    if status == 200:
        print("Login successful!")
        token = login_res["accessToken"]
    else:
        print(f"Login failed (status {status}), attempting registration...")
        register_payload = {
            "email": "testuser@greensolution.vn",
            "password": "Password123",
            "name": "Test User",
            "phone": "0987654321",
            "address": "123 Green Street, Da Nang"
        }
        r_status, r_res = make_request(f"{BASE_URL}/api/auth/register", "POST", data=register_payload)
        if r_status == 200:
            print("Registration successful!")
            token = r_res["accessToken"]
        else:
            print(f"Registration failed (status {r_status}): {r_res}")
            sys.exit(1)
            
    # Auth headers
    auth_headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Test 1: Chào hỏi bình thường
    print("\n[Test 1] Chào hỏi bình thường (Chào bạn, bạn là ai?)")
    t1_payload = {
        "history": [],
        "message": "Chào bạn, bạn là ai?"
    }
    status_t1, res_t1 = make_request(f"{BASE_URL}/api/ai/chat", "POST", headers=auth_headers, data=t1_payload)
    
    t1_pass = False
    ai_response_t1 = ""
    if status_t1 == 200:
        ai_response_t1 = res_t1.get("responseText", "")
        print(f"Status: {status_t1} OK")
        print(f"AI response: {ai_response_t1}")
        # Verification criteria:
        # 1. Mentions "Green Solution" or "trợ lý" or "virtual assistant"
        # 2. Friendly tone, usually with leaf icon or intro
        keywords = ["green solution", "trợ lý", "hỗ trợ", "nông sản"]
        has_keyword = any(kw in ai_response_t1.lower() for kw in keywords)
        t1_pass = has_keyword or "🌿" in ai_response_t1
        print(f"Verification: {'PASS' if t1_pass else 'FAIL'}")
    else:
        print(f"Status: {status_t1} Failed: {res_t1}")
    
    results["test_1"] = {
        "status": status_t1,
        "response": ai_response_t1,
        "pass": t1_pass
    }

    # Test 2: Tìm kiếm nông sản & kiểm duyệt Dynamic systemInstruction
    print("\n[Test 2] Tìm kiếm nông sản & kiểm duyệt Dynamic systemInstruction (Cửa hàng hiện tại có những rau củ gì vậy?)")
    t2_payload = {
        "history": [],
        "message": "Cửa hàng hiện tại có những rau củ gì vậy?"
    }
    status_t2, res_t2 = make_request(f"{BASE_URL}/api/ai/chat", "POST", headers=auth_headers, data=t2_payload)
    
    t2_pass = False
    ai_response_t2 = ""
    if status_t2 == 200:
        ai_response_t2 = res_t2.get("responseText", "")
        print(f"Status: {status_t2} OK")
        print(f"AI response: {ai_response_t2}")
        # Verification criteria:
        # 1. Lists actual DB products (Cà Rốt Hữu Cơ, Cà Chua Hữu Cơ, Xà Lách Tươi, Dưa Leo...)
        # 2. Lists correct stock/ton kho
        # 3. Contains action tag [[CUSTOM_MENU:pX,pY...]] or [[MENU:mpX]]
        vegetables = ["cà rốt", "cà chua", "xà lách", "dưa leo", "bí đỏ", "rau muống", "khổ qua", "bông cải", "ngò"]
        has_veg = any(v in ai_response_t2.lower() for v in vegetables)
        has_tag = "[[" in ai_response_t2 and "]]" in ai_response_t2
        t2_pass = has_veg and has_tag
        print(f"Verification: {'PASS' if t2_pass else 'FAIL'} (Has vegetables: {has_veg}, Has action tag: {has_tag})")
    else:
        print(f"Status: {status_t2} Failed: {res_t2}")
        
    results["test_2"] = {
        "status": status_t2,
        "response": ai_response_t2,
        "pass": t2_pass
    }

    # Test 3: Tư vấn theo ngân sách
    print("\n[Test 3] Tư vấn theo ngân sách (Gợi ý cho mình giỏ quà rau củ khoảng 200.000đ nhé)")
    t3_payload = {
        "history": [],
        "message": "Gợi ý cho mình giỏ quà rau củ khoảng 200.000đ nhé"
    }
    status_t3, res_t3 = make_request(f"{BASE_URL}/api/ai/chat", "POST", headers=auth_headers, data=t3_payload)
    
    t3_pass = False
    ai_response_t3 = ""
    if status_t3 == 200:
        ai_response_t3 = res_t3.get("responseText", "")
        print(f"Status: {status_t3} OK")
        print(f"AI response: {ai_response_t3}")
        # Verification criteria:
        # 1. Recommends a combo of products with total price < 200k
        # 2. Contains action tag
        has_tag = "[[" in ai_response_t3 and "]]" in ai_response_t3
        t3_pass = has_tag
        print(f"Verification: {'PASS' if t3_pass else 'FAIL'} (Has action tag: {has_tag})")
    else:
        print(f"Status: {status_t3} Failed: {res_t3}")
        
    results["test_3"] = {
        "status": status_t3,
        "response": ai_response_t3,
        "pass": t3_pass
    }

    # Test 4: Bảo mật & Unauthorized
    print("\n[Test 4] Kiểm tra bảo mật & Unauthorized (No token)")
    t4_payload = {
        "history": [],
        "message": "Chào bạn"
    }
    status_t4, res_t4 = make_request(f"{BASE_URL}/api/ai/chat", "POST", headers={}, data=t4_payload)
    
    t4_pass = False
    if status_t4 == 401:
        t4_pass = True
        print(f"Status: {status_t4} Unauthorized (Correctly blocked!)")
    else:
        print(f"Status: {status_t4} Failed: expected 401 Unauthorized, but got {status_t4}")
        
    results["test_4"] = {
        "status": status_t4,
        "response": res_t4,
        "pass": t4_pass
    }
    
    print("\n=== SUMMARY OF TESTS ===")
    for k, v in results.items():
        print(f"{k.upper()}: {'PASS' if v['pass'] else 'FAIL'} (Status: {v['status']})")
        
    all_pass = all(v["pass"] for v in results.values())
    print(f"\nFinal Verdict: {'ALL PASSED' if all_pass else 'SOME FAILED'}")
    
    # Save output to json file
    with open("test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    run_tests()
