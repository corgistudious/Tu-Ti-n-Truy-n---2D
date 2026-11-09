extends Control
## Đăng nhập / Đăng ký / Quên mật khẩu

var main
var email: LineEdit
var pw: LineEdit
var server: LineEdit
var status: Label
var box: VBoxContainer

func _ready() -> void:
	var bg = TextureRect.new()
	bg.texture = Assets.tex("res://assets/parallax/sect_0.png")
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.stretch_mode = TextureRect.STRETCH_SCALE
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	add_child(bg)
	for l in [1, 2]:
		var b2 = TextureRect.new()
		b2.texture = Assets.tex("res://assets/parallax/sect_%d.png" % l)
		b2.set_anchors_preset(Control.PRESET_FULL_RECT)
		b2.stretch_mode = TextureRect.STRETCH_SCALE
		b2.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		add_child(b2)
	var center = CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)
	var panel = PanelContainer.new()
	center.add_child(panel)
	box = UI.vbox(10)
	panel.add_child(box)
	var title = UI.lbl("TU TIÊN TRUYỆN 2D", 40, UI.GOLD)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)
	var sub = UI.lbl("Phàm nhân nhập đạo — Võ hiệp — Tu tiên — Phi thăng", 15, UI.DIM)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(sub)
	if not OS.has_feature("web"):
		server = UI.edit("Địa chỉ máy chủ")
		server.text = Config.server_url
		box.add_child(server)
	email = UI.edit("Email")
	email.text = Config.cfg.get_value("auth", "email", "")
	box.add_child(email)
	pw = UI.edit("Mật khẩu", true)
	pw.text_submitted.connect(func(_t): _login())
	box.add_child(pw)
	var row = UI.hbox(8)
	row.add_child(UI.btn("Đăng nhập", _login, 130))
	row.add_child(UI.btn("Đăng ký", _register, 130))
	box.add_child(row)
	box.add_child(UI.btn("Quên mật khẩu?", _forgot))
	status = UI.lbl("", 14, UI.RED, true)
	status.custom_minimum_size.x = 380
	box.add_child(status)
	Sfx.play_bgm("bgm_sect")
	if Config.autotest:
		_autotest.call_deferred()

func _apply_server() -> void:
	if server:
		Config.server_url = server.text.strip_edges().trim_suffix("/")
		Config.save()

func _login() -> void:
	_apply_server()
	status.text = "Đang kết nối..."
	status.add_theme_color_override("font_color", UI.DIM)
	var r = await Net.http("POST", "/api/auth/login", {"email": email.text.strip_edges(), "password": pw.text, "device": OS.get_name()})
	if r.status != 200:
		_err(Net.err_text(r))
		return
	Net.token = r.data.token
	Net.account = r.data.account
	Config.cfg.set_value("auth", "email", email.text.strip_edges())
	Config.save()
	await _after_auth()

func _register() -> void:
	_apply_server()
	var r = await Net.http("POST", "/api/auth/register", {"email": email.text.strip_edges(), "password": pw.text, "device": OS.get_name()})
	if r.status != 200:
		_err(Net.err_text(r))
		return
	if r.data.get("token") == null:
		status.text = "Đăng ký thành công! Kiểm tra email để xác thực rồi đăng nhập."
		status.add_theme_color_override("font_color", UI.GREEN)
		return
	Net.token = r.data.token
	status.text = "Đăng ký thành công! Hãy xác thực email (đã gửi thư)."
	await _after_auth()

func _after_auth() -> void:
	status.text = "Đang tải dữ liệu thế giới..."
	var ok = await GameData.load_bundle()
	if not ok:
		_err("Không tải được dữ liệu game")
		return
	main.show_char_select()

func _err(t: String) -> void:
	status.text = t
	status.add_theme_color_override("font_color", UI.RED)

func _forgot() -> void:
	_apply_server()
	if email.text.strip_edges() == "":
		_err("Nhập email trước")
		return
	await Net.http("POST", "/api/auth/forgot", {"email": email.text.strip_edges()})
	UI.clear(box)
	box.add_child(UI.lbl("Đã gửi mã đặt lại mật khẩu tới email (nếu tồn tại).", 16, UI.PAPER, true))
	var tok = UI.edit("Mã đặt lại trong email")
	var npw = UI.edit("Mật khẩu mới", true)
	box.add_child(tok)
	box.add_child(npw)
	var st = UI.lbl("", 14, UI.RED, true)
	box.add_child(UI.btn("Đặt lại mật khẩu", func():
		var r = await Net.http("POST", "/api/auth/reset", {"token": tok.text.strip_edges(), "password": npw.text})
		if r.status == 200:
			main.show_login()
		else:
			st.text = Net.err_text(r)))
	box.add_child(UI.btn("Quay lại", func(): main.show_login()))
	box.add_child(st)

## Tự kiểm thử (chạy với --autotest): đăng ký tài khoản ngẫu nhiên và vào game
func _autotest() -> void:
	var tag = str(randi() % 1000000)
	email.text = "autotest%s@test.vn" % tag
	pw.text = "matkhau123"
	await _register()
