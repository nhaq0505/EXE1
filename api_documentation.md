# 🌾 Green Solution - Tài Liệu Thiết Kế API (Chi Tiết)

Tài liệu này cung cấp thiết kế chi tiết cho các điểm cuối (endpoints) của RESTful API cho dự án Green Solution.

## 🚀 Thông Tin Chung
- **Base URL**: `https://api.green-solution.com/v1`
- **Định dạng dữ liệu**: `JSON`
- **Xác thực**: `JWT (JSON Web Token)` truyền qua Header `Authorization: Bearer <token>`

### 🚥 Mã Trạng Thái (Status Codes)
| Mã | Ý nghĩa | Mô tả |
|:---|:---|:---|
| `200` | OK | Thành công |
| `201` | Created | Tạo mới thành công |
| `400` | Bad Request | Dữ liệu gửi lên không hợp lệ |
| `401` | Unauthorized | Chưa đăng nhập hoặc Token hết hạn |
| `403` | Forbidden | Không có quyền truy cập |
| `404` | Not Found | Không tìm thấy tài nguyên |
| `500` | Server Error | Lỗi hệ thống |

---

## 📦 Mô Hình Dữ Liệu (Schemas)

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "USER | ADMIN",
  "address": "string",
  "phone": "string",
  "createdAt": "datetime"
}
```

### Farm
```json
{
  "id": "string",
  "name": "string",
  "image": "string (url)",
  "description": "string",
  "location": "string",
  "rating": "number (0-5)",
  "videoUrl": "string (hls/rtmp url)"
}
```

### Product
```json
{
  "id": "string",
  "farmId": "string",
  "name": "string",
  "image": "string (url)",
  "price": "number",
  "category": "string",
  "unit": "string (kg, bó, túi...)",
  "stock": "number"
}
```

---

## 👤 Nhóm API: Tài Khoản & Hồ Sơ

### 1. Đăng ký tài khoản
- **Endpoint**: `POST /auth/register`
- **Body**: `{ "name", "email", "password" }`
- **Success (201)**: `{ "message": "Đăng ký thành công", "userId": "u1" }`

### 2. Đăng nhập
- **Endpoint**: `POST /auth/login`
- **Body**: `{ "email", "password" }`
- **Success (200)**: 
  ```json
  {
    "token": "eyJhbG...",
    "user": { "id": "u1", "name": "Nguyễn Văn A", "role": "USER" }
  }
  ```

### 3. Thông tin cá nhân (Profile)
- **Get Profile**: `GET /users/profile` (Yêu cầu Token)
- **Update Profile**: `PUT /users/profile`
  - **Body**: `{ "name", "phone", "address" }`

---

## 🛡️ Nhóm API: Quản Trị Viên (Admin)

### 1. Danh sách người dùng
- **Endpoint**: `GET /admin/users`
- **Params**: `page=1&limit=10&search=keyword`
- **Success (200)**: `{ "data": [User], "total": 100 }`

### 2. Cập nhật quyền hạn/thông tin
- **Endpoint**: `PUT /admin/users/{id}`
- **Body**: `{ "role": "ADMIN", "isActive": false }`

---

## 🚜 Nhóm API: Nông Trại & Sản Phẩm

### 1. Danh sách nông trại
- **Endpoint**: `GET /farms`
- **Success (200)**: `[Farm]`

### 2. Chi tiết nông trại & Sản phẩm của họ
- **Endpoint**: `GET /farms/{id}`
- **Success (200)**: 
  ```json
  {
    "farm": {Farm},
    "products": [Product]
  }
  ```

### 3. Tìm kiếm sản phẩm
- **Endpoint**: `GET /products`
- **Params**: `category=Rau&minPrice=10000&maxPrice=50000`

---

## 🍱 Nhóm API: Thực Đơn Thông Minh (Meal Plans)

### 1. Danh sách thực đơn
- **Endpoint**: `GET /meal-plans`
- **Response**: `[MealPlan]` (Chứa thông tin calories, giá tổng, các món ăn)

### 2. Chi tiết thực đơn & Nguyên liệu
- **Endpoint**: `GET /meal-plans/{id}`
- **Success (200)**:
  ```json
  {
    "id": "mp1",
    "title": "Thực Đơn Đôi Lứa",
    "ingredients": [
      { "productId": "p1", "name": "Cà chua", "quantity": 1, "unit": "kg" }
    ]
  }
  ```

---

## 🛒 Nhóm API: Đơn Hàng (Orders)

### 1. Đặt hàng
- **Endpoint**: `POST /orders` (Yêu cầu Token)
- **Body**:
  ```json
  {
    "address": { "name", "phone", "location", "notes" },
    "items": [ { "productId", "quantity" } ],
    "paymentMethod": "COD | BANKING"
  }
  ```

### 2. Lịch sử đơn hàng
- **Endpoint**: `GET /orders`
- **Success (200)**: `[ { "id", "totalPrice", "status", "createdAt" } ]`

---

## 🤖 Nhóm API: AI Chatbot (Hỗ Trợ)

### Gửi tin nhắn tư vấn
- **Endpoint**: `POST /chatbot/message`
- **Body**: `{ "message": "string" }`
- **Success (200)**:
  ```json
  {
    "reply": "Câu trả lời từ AI...",
    "productSuggestions": [Product],
    "mealPlanSuggestions": [MealPlan]
  }
  ```
 giao, DELIVERED - Đã giao, CANCELLED - Đã hủy).

---

## 🤖 AI Chatbot

### [POST] /chatbot/message
Gửi câu hỏi hoặc yêu cầu đến trợ lý ảo AI.
- **Dữ liệu gửi lên (Payload)**: `{ "message": "Tôi muốn mua rau xanh cho gia đình 4 người" }`
- **Phản hồi (Response)**:
  ```json
  {
    "reply": "Chào bạn! Tôi gợi ý bạn thử 'Thực Đơn Gia Đình Chuẩn' rất phù hợp cho 4 người...",
    "suggestions": [
      { "type": "meal-plan", "id": "mp3" },
      { "type": "product", "id": "p2" }
    ]
  }
  ```
