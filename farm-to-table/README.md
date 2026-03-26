# 🌾 Green Solution

> **"Từ Nông Trại Xanh Đến Bàn Ăn Của Bạn."**

Green Solution là một ứng dụng web kết nối trực tiếp người tiêu dùng với các nông trại địa phương, mang đến thực phẩm sạch, an toàn và phát triển bền vững. Giao diện được thiết kế hiện đại, mô phỏng theo phong cách của Shadcn/ui, tập trung vào trải nghiệm người dùng tối ưu.

## ✨ Tính năng nổi bật

*   **🔴 Live Camera 24/24**: Tích hợp video stream mô phỏng camera an ninh trực tiếp tại nông trại, giúp người dùng an tâm về nguồn gốc và quá trình nuôi trồng.
*   **🔍 Bộ lọc & Tìm kiếm thông minh**: Lọc sản phẩm theo danh mục (Rau củ, Trái cây, Thịt...) và tìm kiếm Text thời gian thực.
*   **🛒 Quản lý Giỏ hàng (Context API)**:
    *   Thêm, bớt, xóa sản phẩm.
    *   Cửa sổ trượt (Cart Drawer) mượt mà.
    *   Tự động tính toán tổng hóa đơn theo tiền tệ VNĐ.
*   **🤖 AI Chatbot Assistant**: Trợ lý ảo mô phỏng AI được tích hợp sẵn, hiển thị ở mọi trang để tư vấn thực phẩm, tự động nhận diện từ khóa và gợi ý sản phẩm phù hợp.
*   **💳 Quy trình Thanh toán an toàn**: Form thu thập thông tin người dùng với xác thực cơ bản, thiết kế 2 cột chuẩn thương mại điện tử (Order Summary + Checkout Form).

## 🛠️ Tech Stack

Dự án này được xây dựng hoàn toàn bằng hệ sinh thái Frontend hiện đại mới nhất:

*   **Core**: React 19 + TypeScript
*   **Build Tool**: Vite v8
*   **Styling**: Tailwind CSS v4 + `clsx` + `tailwind-merge` (Xây dựng UI components chuẩn Shadcn/ui mà không cần cài đặt thư viện kềnh càng).
*   **Routing**: React Router v7
*   **Icons**: Lucide React
*   **State Management**: React Context API & Custom Hooks (Không sử dụng Redux/Zustand để giữ hệ thống siêu nhẹ).

## 🚀 Hướng dẫn Cài đặt & Chạy (Local)

Yêu cầu máy tính của bạn đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18+ trở lên).

1.  **Clone / Tải source code** về máy và mở terminal tại thư mục dự án `farm-to-table`.
2.  **Cài đặt các dependencies**:
    ```bash
    npm install
    ```
3.  **Chạy server phát triển (Development mode)**:
    ```bash
    npm run dev
    ```
4.  Mở trình duyệt truy cập vào đường dẫn: `http://localhost:5173`

## 📦 Build cho Production

Chạy lệnh sau để đóng gói dự án. Tất cả file tối ưu hóa sẽ nằm trong thư mục `dist/`.

```bash
npm run build
```

## 🌐 Hướng dẫn Deploy lên Netlify

Dự án này sử dụng Vite và React Router (Client-side routing). Để deploy lên Netlify chuẩn nhất, hệ thống đã được cấu hình sẵn file `public/_redirects` để điều hướng mọi đường dẫn ảo về `index.html`.

1. Đẩy mã nguồn lên **GitHub** (hoặc GitLab/Bitbucket).
2. Đăng nhập vào [Netlify](https://www.netlify.com/).
3. Bấm **Add new site** > **Import an existing project**.
4. Chọn repository GitHub chứa dự án của bạn.
5. Cấu hình build (Netlify thường tự động nhận diện đúng):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Bấm **Deploy site** và chờ khoảng 30s. Bạn sẽ nhận được 1 đường dẫn để truy cập dự án trực tuyến.
