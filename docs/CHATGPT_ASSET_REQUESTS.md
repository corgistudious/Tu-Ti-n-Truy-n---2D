# Danh sách tài nguyên yêu cầu ChatGPT (Manual Mode)

Quy trình: copy prompt → ChatGPT → tải PNG → đặt vào `asset-pipeline/inbox/<ID>.png` → `npm run import -w asset-pipeline` → kiểm tra trong game → `npm run approve -w asset-pipeline -- <ID> --license "<giấy phép>" --reviewer "<tên>"`.

## character (36)

### char_body_male — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_body_male — Lớp thân (da) nam — xám để tô màu da
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_body_female — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_body_female — Lớp thân (da) nữ — xám để tô màu da
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_0_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_0_0 — Khuôn mặt 0, mắt 0
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_0_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_0_1 — Khuôn mặt 0, mắt 1
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_0_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_0_2 — Khuôn mặt 0, mắt 2
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_0_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_0_3 — Khuôn mặt 0, mắt 3
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_1_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_1_0 — Khuôn mặt 1, mắt 0
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_1_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_1_1 — Khuôn mặt 1, mắt 1
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_1_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_1_2 — Khuôn mặt 1, mắt 2
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_1_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_1_3 — Khuôn mặt 1, mắt 3
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_2_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_2_0 — Khuôn mặt 2, mắt 0
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_2_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_2_1 — Khuôn mặt 2, mắt 1
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_2_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_2_2 — Khuôn mặt 2, mắt 2
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_2_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_2_3 — Khuôn mặt 2, mắt 3
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_3_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_3_0 — Khuôn mặt 3, mắt 0
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_3_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_3_1 — Khuôn mặt 3, mắt 1
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_3_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_3_2 — Khuôn mặt 3, mắt 2
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_face_3_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_face_3_3 — Khuôn mặt 3, mắt 3
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_hair_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_hair_0 — Kiểu tóc 0 — xám để tô màu tóc
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_hair_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_hair_1 — Kiểu tóc 1 — xám để tô màu tóc
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_hair_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_hair_2 — Kiểu tóc 2 — xám để tô màu tóc
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_hair_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_hair_3 — Kiểu tóc 3 — xám để tô màu tóc
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_hair_4 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_hair_4 — Kiểu tóc 4 — xám để tô màu tóc
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_hair_5 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_hair_5 — Kiểu tóc 5 — xám để tô màu tóc
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_outfit_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_outfit_0 — Trang phục 0 — xám để tô màu áo
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_legs_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_legs_0 — Quần/giày trang phục 0
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_belt_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_belt_0 — Đai/cổ áo trang phục 0
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_outfit_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_outfit_1 — Trang phục 1 — xám để tô màu áo
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_legs_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_legs_1 — Quần/giày trang phục 1
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_belt_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_belt_1 — Đai/cổ áo trang phục 1
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_outfit_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_outfit_2 — Trang phục 2 — xám để tô màu áo
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_legs_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_legs_2 — Quần/giày trang phục 2
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_belt_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_belt_2 — Đai/cổ áo trang phục 2
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_outfit_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_outfit_3 — Trang phục 3 — xám để tô màu áo
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_legs_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_legs_3 — Quần/giày trang phục 3
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### char_belt_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: char_belt_3 — Đai/cổ áo trang phục 3
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## weapon (15)

### wpn_sword_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_sword_0 — Vũ khí sword bậc 0 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_sword_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_sword_1 — Vũ khí sword bậc 1 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_sword_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_sword_2 — Vũ khí sword bậc 2 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_sword_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_sword_3 — Vũ khí sword bậc 3 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_sword_4 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_sword_4 — Vũ khí sword bậc 4 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_saber_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_saber_0 — Vũ khí saber bậc 0 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_saber_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_saber_1 — Vũ khí saber bậc 1 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_saber_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_saber_2 — Vũ khí saber bậc 2 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_saber_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_saber_3 — Vũ khí saber bậc 3 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_saber_4 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_saber_4 — Vũ khí saber bậc 4 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_staff_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_staff_0 — Vũ khí staff bậc 0 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_staff_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_staff_1 — Vũ khí staff bậc 1 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_staff_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_staff_2 — Vũ khí staff bậc 2 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_staff_3 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_staff_3 — Vũ khí staff bậc 3 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### wpn_staff_4 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: wpn_staff_4 — Vũ khí staff bậc 4 cầm tay theo khung hình nhân vật
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## monster (13)

### mon_slime — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_slime — Quái nguyên mẫu slime; dùng cho: Lục Linh Nhầy, Độc Thiềm, Bảo Rương Yêu
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_bird — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_bird — Quái nguyên mẫu bird; dùng cho: Gà Rừng Hung Dữ, Dược Đường Lang, Kiếm Hạc, Linh Ưng, Lôi Điểu, Lôi Bằng Vương, Tiên Hạc Hộ Đài
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_fox — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_fox — Quái nguyên mẫu fox; dùng cho: Tiểu Linh Hồ, Kim Vĩ Linh Hồ, Vân Thú
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_treant — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_treant — Quái nguyên mẫu treant; dùng cho: Trúc Yêu, Thanh Trúc Yêu Vương, Cổ Mộc Tinh, Thụ Yêu Thiên Niên
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_wolf — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_wolf — Quái nguyên mẫu wolf; dùng cho: Hắc Phong Lang, Phong Lang
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_boar — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_boar — Quái nguyên mẫu boar; dùng cho: Thiết Bì Trư, Chiến Thú Cổ
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_golem — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_golem — Quái nguyên mẫu golem; dùng cho: Mộc Nhân Luyện Công, Thạch Khôi Lỗi, Thiết Vệ Rỉ Sét, Sơn Viên, Thủ Sơn Khôi Lỗi, Lôi Khôi, Thượng Cổ Thủ Vệ, Thiên Đế Ngự Tiền Kim Giáp, Thượng Cổ Khôi Lỗi
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_spirit — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_spirit — Quái nguyên mẫu spirit; dùng cho: Kiếm Linh, Cổ Kiếm Chi Hồn, U Hồn, Hư Không Hành Giả, Tinh Linh, Oán Linh, Tiên Ảnh
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_tiger — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_tiger — Quái nguyên mẫu tiger; dùng cho: Ban Lan Hổ, Yêu Thú Vương Bạch Ngạch, Hộ Sơn Kiếm Thú, Ấu Kỳ Lân, Niên Thú Đèn Lồng
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_snake — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_snake — Quái nguyên mẫu snake; dùng cho: Lục Ngọc Xà, Vạn Độc Tri Chu Hậu, Thượng Cổ Mãng, Hỗn Độn Man
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_skeleton — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_skeleton — Quái nguyên mẫu skeleton; dùng cho: Khô Lâu Chiến Sĩ, Quỷ Tướng, Chiến Hồn
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_demon — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_demon — Quái nguyên mẫu demon; dùng cho: U Minh Quỷ Vương, Cổ Chiến Thần Tàn Hồn, Ma Binh, Ma Pháp Sư, Ma Vực Huyết Quân, Thiên Ngoại Cự Thần, Hỗn Độn Thú, Quỷ Mẫu, Đọa Tiên
Sprite sheet 256×320px, lưới 4 cột, mỗi khung 64×64px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### mon_dragon — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: mon_dragon — Quái nguyên mẫu dragon; dùng cho: Hỗn Độn Cổ Long, Thượng Cổ Thao Thiết
Sprite sheet 512×640px, lưới 4 cột, mỗi khung 128×128px, các hàng theo thứ tự: idle(4), move(4), attack(4), hurt(2), death(4). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## tileset (26)

### tiles_village — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_village — Tileset village: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_bamboo — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_bamboo — Tileset bamboo: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_dark_mountain — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_dark_mountain — Tileset dark_mountain: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_city — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_city — Tileset city: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_academy — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_academy — Tileset academy: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_villa — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_villa — Tileset villa: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_wild_mountain — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_wild_mountain — Tileset wild_mountain: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_herb_valley — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_herb_valley — Tileset herb_valley: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_sect — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_sect — Tileset sect: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_ghost_cave — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_ghost_cave — Tileset ghost_cave: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_battlefield — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_battlefield — Tileset battlefield: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_cloud_land — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_cloud_land — Tileset cloud_land: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_cult_city — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_cult_city — Tileset cult_city: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_pavilion — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_pavilion — Tileset pavilion: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_thunder_peak — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_thunder_peak — Tileset thunder_peak: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_ancient_ruins — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_ancient_ruins — Tileset ancient_ruins: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_demon_realm — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_demon_realm — Tileset demon_realm: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_void — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_void — Tileset void: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_ascension — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_ascension — Tileset ascension: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_immortal_city — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_immortal_city — Tileset immortal_city: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_immortal_mountain — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_immortal_mountain — Tileset immortal_mountain: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_heaven_palace — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_heaven_palace — Tileset heaven_palace: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_chaos_sea — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_chaos_sea — Tileset chaos_sea: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_inner_world — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_inner_world — Tileset inner_world: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_cave_home — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_cave_home — Tileset cave_home: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### tiles_arena — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: tiles_arena — Tileset arena: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]
Ảnh 256×32px, chia ô 32×32.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## parallax (78)

### parallax_village_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_village_0 — Nền parallax village lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_village_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_village_1 — Nền parallax village lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_village_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_village_2 — Nền parallax village lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_bamboo_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_bamboo_0 — Nền parallax bamboo lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_bamboo_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_bamboo_1 — Nền parallax bamboo lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_bamboo_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_bamboo_2 — Nền parallax bamboo lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_dark_mountain_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_dark_mountain_0 — Nền parallax dark_mountain lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_dark_mountain_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_dark_mountain_1 — Nền parallax dark_mountain lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_dark_mountain_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_dark_mountain_2 — Nền parallax dark_mountain lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_city_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_city_0 — Nền parallax city lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_city_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_city_1 — Nền parallax city lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_city_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_city_2 — Nền parallax city lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_academy_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_academy_0 — Nền parallax academy lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_academy_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_academy_1 — Nền parallax academy lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_academy_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_academy_2 — Nền parallax academy lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_villa_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_villa_0 — Nền parallax villa lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_villa_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_villa_1 — Nền parallax villa lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_villa_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_villa_2 — Nền parallax villa lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_wild_mountain_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_wild_mountain_0 — Nền parallax wild_mountain lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_wild_mountain_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_wild_mountain_1 — Nền parallax wild_mountain lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_wild_mountain_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_wild_mountain_2 — Nền parallax wild_mountain lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_herb_valley_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_herb_valley_0 — Nền parallax herb_valley lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_herb_valley_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_herb_valley_1 — Nền parallax herb_valley lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_herb_valley_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_herb_valley_2 — Nền parallax herb_valley lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_sect_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_sect_0 — Nền parallax sect lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_sect_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_sect_1 — Nền parallax sect lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_sect_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_sect_2 — Nền parallax sect lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ghost_cave_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ghost_cave_0 — Nền parallax ghost_cave lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ghost_cave_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ghost_cave_1 — Nền parallax ghost_cave lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ghost_cave_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ghost_cave_2 — Nền parallax ghost_cave lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_battlefield_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_battlefield_0 — Nền parallax battlefield lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_battlefield_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_battlefield_1 — Nền parallax battlefield lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_battlefield_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_battlefield_2 — Nền parallax battlefield lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cloud_land_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cloud_land_0 — Nền parallax cloud_land lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cloud_land_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cloud_land_1 — Nền parallax cloud_land lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cloud_land_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cloud_land_2 — Nền parallax cloud_land lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cult_city_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cult_city_0 — Nền parallax cult_city lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cult_city_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cult_city_1 — Nền parallax cult_city lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cult_city_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cult_city_2 — Nền parallax cult_city lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_pavilion_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_pavilion_0 — Nền parallax pavilion lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_pavilion_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_pavilion_1 — Nền parallax pavilion lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_pavilion_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_pavilion_2 — Nền parallax pavilion lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_thunder_peak_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_thunder_peak_0 — Nền parallax thunder_peak lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_thunder_peak_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_thunder_peak_1 — Nền parallax thunder_peak lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_thunder_peak_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_thunder_peak_2 — Nền parallax thunder_peak lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ancient_ruins_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ancient_ruins_0 — Nền parallax ancient_ruins lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ancient_ruins_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ancient_ruins_1 — Nền parallax ancient_ruins lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ancient_ruins_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ancient_ruins_2 — Nền parallax ancient_ruins lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_demon_realm_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_demon_realm_0 — Nền parallax demon_realm lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_demon_realm_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_demon_realm_1 — Nền parallax demon_realm lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_demon_realm_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_demon_realm_2 — Nền parallax demon_realm lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_void_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_void_0 — Nền parallax void lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_void_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_void_1 — Nền parallax void lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_void_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_void_2 — Nền parallax void lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ascension_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ascension_0 — Nền parallax ascension lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ascension_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ascension_1 — Nền parallax ascension lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_ascension_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_ascension_2 — Nền parallax ascension lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_immortal_city_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_immortal_city_0 — Nền parallax immortal_city lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_immortal_city_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_immortal_city_1 — Nền parallax immortal_city lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_immortal_city_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_immortal_city_2 — Nền parallax immortal_city lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_immortal_mountain_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_immortal_mountain_0 — Nền parallax immortal_mountain lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_immortal_mountain_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_immortal_mountain_1 — Nền parallax immortal_mountain lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_immortal_mountain_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_immortal_mountain_2 — Nền parallax immortal_mountain lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_heaven_palace_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_heaven_palace_0 — Nền parallax heaven_palace lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_heaven_palace_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_heaven_palace_1 — Nền parallax heaven_palace lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_heaven_palace_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_heaven_palace_2 — Nền parallax heaven_palace lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_chaos_sea_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_chaos_sea_0 — Nền parallax chaos_sea lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_chaos_sea_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_chaos_sea_1 — Nền parallax chaos_sea lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_chaos_sea_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_chaos_sea_2 — Nền parallax chaos_sea lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_inner_world_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_inner_world_0 — Nền parallax inner_world lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_inner_world_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_inner_world_1 — Nền parallax inner_world lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_inner_world_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_inner_world_2 — Nền parallax inner_world lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cave_home_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cave_home_0 — Nền parallax cave_home lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cave_home_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cave_home_1 — Nền parallax cave_home lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_cave_home_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_cave_home_2 — Nền parallax cave_home lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_arena_0 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_arena_0 — Nền parallax arena lớp 0 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_arena_1 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_arena_1 — Nền parallax arena lớp 1 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### parallax_arena_2 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: parallax_arena_2 — Nền parallax arena lớp 2 (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch
Ảnh 640×360px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## icon (2)

### icons_items — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: icons_items — Atlas icon vật phẩm 32×32 (94 icon)
Atlas lưới 16 cột, ô 32×32px, mỗi ô một biểu tượng theo đúng thứ tự trong assets/icons/*.json.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### icons_skills — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: icons_skills — Atlas icon kỹ năng 64×64 (77 kỹ năng)
Atlas lưới 8 cột, ô 64×64px, mỗi ô một biểu tượng theo đúng thứ tự trong assets/icons/*.json.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## portrait (67)

### portrait_npc_village_chief — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_village_chief — Chân dung Lý Bá — Trưởng Thôn
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_father — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_father — Chân dung Lâm Đại Sơn — Thợ Săn Già
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_martial_teacher — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_martial_teacher — Chân dung Trần Cương — Võ Sư
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_herbalist_girl — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_herbalist_girl — Chân dung Tiểu Dược Linh — Dược Đồng
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_blacksmith_village — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_blacksmith_village — Chân dung Vương Thiết — Thợ Rèn
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_storage_village — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_storage_village — Chân dung Lão Chu — Thủ Kho
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_grandma — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_grandma — Chân dung Bà Lão Mù — Người Kể Chuyện
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_hunter — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_hunter — Chân dung A Tứ — Thợ Săn
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_lost_child — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_lost_child — Chân dung Tiểu Bảo — Đứa Trẻ Lạc
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_scout — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_scout — Chân dung Triệu Ảnh — Trinh Sát Thanh Vân
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_captive_merchant — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_captive_merchant — Chân dung Tiền Phú Quý — Thương Nhân
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_city_lord — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_city_lord — Chân dung Mộ Dung Thanh — Thành Chủ Thanh Vân
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_merchant_city — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_merchant_city — Chân dung Hà Ký — Tạp Hóa
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_market — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_market — Chân dung Lục Kim — Quản Sự Chợ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_guild_manager — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_guild_manager — Chân dung Bạch Vân Sứ — Tông Môn Sứ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_arena_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_arena_master — Chân dung Thiết Diện — Chủ Đấu Trường
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_housing_agent — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_housing_agent — Chân dung Phương Địa Chủ — Địa Chủ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_teleporter — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_teleporter — Chân dung Phi Mã Dịch Trạm — Dịch Trạm
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_storage_city — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_storage_city — Chân dung Kim Khố Quản — Thủ Kho
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_alchemist_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_alchemist_master — Chân dung Đan Thánh Tôn — Đan Sư
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_forge_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_forge_master — Chân dung Âu Dã Tử — Đại Sư Luyện Khí
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_pet_keeper — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_pet_keeper — Chân dung Linh Nhi — Ngự Thú Sư
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_event — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_event — Chân dung Nguyệt Sứ — Sứ Giả Sự Kiện
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_tailor — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_tailor — Chân dung Tô Cẩm Nương — Thợ May
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_bounty_board — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_bounty_board — Chân dung Bảng Treo Thưởng — Nhiệm Vụ Hằng Ngày
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_fisherman — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_fisherman — Chân dung Ngư Ông — Ngư Phủ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_academy_dean — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_academy_dean — Chân dung Tư Mã Huyền — Viện Trưởng
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_academy_instructor — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_academy_instructor — Chân dung Lôi Chấn — Giáo Đầu
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_academy_librarian — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_academy_librarian — Chân dung Thư Lão — Quản Thư
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_sword_villa_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_sword_villa_master — Chân dung Âu Dương Kiếm — Trang Chủ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_old_servant — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_old_servant — Chân dung Phúc Bá — Lão Bộc
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_beast_tamer — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_beast_tamer — Chân dung Mạc Hổ — Thợ Săn Yêu Thú
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_injured_disciple — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_injured_disciple — Chân dung Tống Viễn — Đệ Tử Bị Thương
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_valley_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_valley_master — Chân dung Dược Vương — Cốc Chủ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_poisoned_villager — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_poisoned_villager — Chân dung Lưu Nhị — Dân Làng Trúng Độc
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_sect_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_sect_master — Chân dung Kiếm Vô Trần — Tông Chủ Thiên Kiếm Tông
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_sect_elder — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_sect_elder — Chân dung Thanh Phong Trưởng Lão — Truyền Công Trưởng Lão
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_sect_quartermaster — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_sect_quartermaster — Chân dung Hoàng Quản Sự — Quản Sự Tông Môn
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_sect_mission — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_sect_mission — Chân dung Nhiệm Vụ Đường — Chấp Sự
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_sect_gate — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_sect_gate — Chân dung Thủ Giới Sứ — Người Giữ Cổng Giới
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ghost_hunter — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ghost_hunter — Chân dung Chung Quỳ Hậu Nhân — Trừ Quỷ Sư
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_war_veteran — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_war_veteran — Chân dung Lão Binh Tần — Cựu Binh
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_immortal_guide — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_immortal_guide — Chân dung Vân Du Tử — Tiếp Dẫn Sứ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_city_lord — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_city_lord — Chân dung Huyền Cơ Chân Nhân — Thành Chủ Thiên Huyền
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_merchant — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_merchant — Chân dung Đa Bảo Thương — Thương Nhân
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_market — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_market — Chân dung Kim Ngọc Quản Sự — Quản Sự Chợ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_teleporter — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_teleporter — Chân dung Truyền Tống Trận Sư — Trận Sư
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_storage — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_storage — Chân dung Tàng Bảo Sứ — Thủ Kho
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_guild — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_guild — Chân dung Tông Vụ Sứ — Tông Môn Sứ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_arena — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_arena — Chân dung Luận Đạo Đài Chủ — Đấu Trường
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_th_skill_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_th_skill_master — Chân dung Tàng Kinh Các Chủ — Truyền Pháp
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_treasure_pavilion — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_treasure_pavilion — Chân dung Vạn Bảo Lão Nhân — Các Chủ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_auctioneer — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_auctioneer — Chân dung Ngọc Thù — Đấu Giá Sư
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_tribulation_elder — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_tribulation_elder — Chân dung Độ Ách Lão Tổ — Hộ Kiếp Nhân
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ancient_spirit — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ancient_spirit — Chân dung Cổ Linh — Tàn Hồn Thượng Cổ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_demon_defector — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_demon_defector — Chân dung Mặc Uyên — Ma Tu Quy Thuận
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_frontline_commander — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_frontline_commander — Chân dung Thiết Huyết Tướng Quân — Thống Lĩnh
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ascension_envoy — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ascension_envoy — Chân dung Tiếp Dẫn Tiên Quan — Tiên Quan
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ct_city_lord — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ct_city_lord — Chân dung Cửu Thiên Huyền Nữ — Thành Chủ Tiên Thành
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ct_merchant — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ct_merchant — Chân dung Tiên Thương — Thương Nhân
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ct_market — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ct_market — Chân dung Thiên Thị Quản Sự — Quản Sự Chợ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ct_storage — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ct_storage — Chân dung Tiên Khố Sứ — Thủ Kho
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ct_teleporter — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ct_teleporter — Chân dung Tinh Môn Sứ — Truyền Tống
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_ct_skill_master — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_ct_skill_master — Chân dung Tiên Pháp Truyền Nhân — Truyền Pháp
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_immortal_hermit — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_immortal_hermit — Chân dung Ẩn Tiên — Ẩn Sĩ
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_heaven_herald — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_heaven_herald — Chân dung Truyền Lệnh Tiên Quan — Tiên Quan
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

### portrait_npc_chaos_ferryman — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: portrait_npc_chaos_ferryman — Chân dung Độ Hải Nhân — Người Chèo Đò
Ảnh 256×256px.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## audio (28)

### bgm_village — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề village (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### bgm_forest — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề forest (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### bgm_mountain — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề mountain (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### bgm_city — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề city (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### bgm_cave — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề cave (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### bgm_battle — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề battle (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### bgm_celestial — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề celestial (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### bgm_chaos — trạng thái: placeholder

```
[ÂM THANH] Nhạc nền chủ đề chaos (ngũ cung, lặp). Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_slash — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh slash. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_hit — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh hit. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_crit — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh crit. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_magic — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh magic. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_fire — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh fire. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_ice — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh ice. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_thunder — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh thunder. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_poison — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh poison. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_jump — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh jump. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_pickup — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh pickup. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_coin — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh coin. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_ui_click — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh ui_click. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_ui_open — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh ui_open. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_levelup — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh levelup. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_breakthrough — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh breakthrough. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_tribulation — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh tribulation. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_monster_hit — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh monster_hit. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_monster_die — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh monster_die. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_boss_roar — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh boss_roar. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

### sfx_step — trạng thái: placeholder

```
[ÂM THANH] Hiệu ứng âm thanh step. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)
```

## character_preview (1)

### CHR_001 — trạng thái: placeholder

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: CHR_001 — Thiếu Niên Nhập Đạo: tóc đen, mắt sáng, áo võ sinh xanh lam, đai nâu, quần tối, giày vải, kiếm gỗ. Idle/Run/Jump/Attack/Hurt/Death/Cast.
Sprite sheet 512×768px, lưới 8 cột, mỗi khung 64×96px, các hàng theo thứ tự: idle(4), run(6), jump(2), attack(4), hurt(2), death(4), cast(4), meditate(2). Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.
Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.
Giữ nguyên thiết kế nhân vật giống hệt nhau giữa MỌI khung hình và animation.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```

## font (1)

### font_be_vietnam_pro — trạng thái: approved

```
TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).

Tài nguyên: font_be_vietnam_pro — Font giao diện hỗ trợ đầy đủ tiếng Việt
Ảnh undefined×undefinedpx.
Đầu ra: một file PNG duy nhất đúng kích thước trên.
```
