extends Control
## Chọn nhân vật, xóa có xác nhận + thời gian bảo vệ, quản lý phiên đăng nhập, đổi mật khẩu.

var main
var list: VBoxContainer
var preview_root: Control
var status: Label
var chars = []
var selected = -1

func _ready() -> void:
	var bg = ColorRect.new(); bg.color = Color(0.06, 0.05, 0.09); bg.set_anchors_preset(Control.PRESET_FULL_RECT); add_child(bg)
	var margin = MarginContainer.new(); margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	for s in ["left", "right", "top", "bottom"]: margin.add_theme_constant_override("margin_" + s, 24)
	add_child(margin)
	var h = UI.hbox(20); margin.add_child(h)
	var left = PanelContainer.new(); left.custom_minimum_size = Vector2(420, 0); h.add_child(left)
	var lv = UI.vbox(8); left.add_child(lv)
	lv.add_child(UI.lbl("Chọn Nhân Vật", 26, UI.GOLD))
	list = UI.vbox(6); lv.add_child(list)
	status = UI.lbl("", 14, UI.RED, true); lv.add_child(status)
	var row = UI.hbox(); lv.add_child(row)
	row.add_child(UI.btn("Vào game", _play))
	row.add_child(UI.btn("Tạo mới", func(): main.show_char_create()))
	row.add_child(UI.btn("Xóa", _delete))
	var row2 = UI.hbox(); lv.add_child(row2)
	row2.add_child(UI.btn("Phiên đăng nhập", _sessions))
	row2.add_child(UI.btn("Đổi mật khẩu", _change_pw))
	row2.add_child(UI.btn("Đăng xuất", _logout))
	preview_root = Control.new(); preview_root.size_flags_horizontal = Control.SIZE_EXPAND_FILL; h.add_child(preview_root)
	_load()

func _load() -> void:
	var r = await Net.http("GET", "/api/characters")
	if r.status != 200:
		status.text = Net.err_text(r)
		return
	chars = r.data
	UI.clear(list)
	for i in chars.size():
		var c = chars[i]
		var label = "%s — %s tầng %d" % [c.name, GameData.realm_name(int(c.realm_idx)), int(c.layer)]
		if c.delete_requested_at != null:
			label += " (chờ xóa)"
		var b = UI.btn(label, func(): _select(i))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		list.add_child(b)
		if c.delete_requested_at != null:
			list.add_child(UI.btn("  Khôi phục %s" % c.name, func(): _restore(int(c.id))))
	if chars.size() > 0:
		_select(0)
	elif Config.autotest:
		main.show_char_create()

func _select(i: int) -> void:
	selected = i
	UI.clear(preview_root)
	var c = chars[i]
	var spr = LayeredSprite.new()
	spr.set_appearance(c.appearance)
	spr.scale = Vector2(4, 4)
	spr.position = Vector2(300, 520)
	preview_root.add_child(spr)
	var info = UI.lbl("%s\n%s tầng %d\nBản đồ: %s" % [c.name, GameData.realm_name(int(c.realm_idx)), int(c.layer), GameData.maps.get(c.map_id, {}).get("name", c.map_id)], 20, UI.PAPER)
	info.position = Vector2(80, 40)
	preview_root.add_child(info)
	if Config.autotest:
		_play.call_deferred()

func _play() -> void:
	if selected < 0:
		return
	var c = chars[selected]
	if c.delete_requested_at != null:
		status.text = "Nhân vật đang chờ xóa — khôi phục trước"
		return
	main.enter_game(int(c.id))

func _delete() -> void:
	if selected < 0:
		return
	var c = chars[selected]
	var w = UI.window("Xóa nhân vật", 440, 220)
	w.body.add_child(UI.lbl("Nhập chính xác tên \"%s\" để xác nhận. Nhân vật được bảo vệ 24 giờ trước khi xóa vĩnh viễn." % c.name, 15, UI.PAPER, true))
	var e = UI.edit("Tên nhân vật")
	w.body.add_child(e)
	var st = UI.lbl("", 14, UI.RED)
	w.body.add_child(UI.btn("Xác nhận xóa", func():
		var r = await Net.http("POST", "/api/characters/%d/delete" % int(c.id), {"confirmName": e.text})
		if r.status == 200:
			w.root.queue_free(); _load()
		else:
			st.text = Net.err_text(r)))
	w.body.add_child(st)
	_popup(w.root)

func _restore(id: int) -> void:
	await Net.http("POST", "/api/characters/%d/restore" % id, {})
	_load()

func _popup(n: Control) -> void:
	var c = CenterContainer.new(); c.set_anchors_preset(Control.PRESET_FULL_RECT); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(c); c.add_child(n)
	n.tree_exited.connect(func(): c.queue_free())

func _sessions() -> void:
	var w = UI.window("Phiên đăng nhập", 620, 380)
	var r = await Net.http("GET", "/api/auth/sessions")
	if r.status == 200:
		for s in r.data:
			var row = UI.hbox()
			row.add_child(UI.lbl("%s  %s  %s%s" % [s.device, s.ip, str(s.last_seen_at).substr(0, 16), " (hiện tại)" if s.current else ""], 14))
			if not s.current:
				var sid: String = s.id
				row.add_child(UI.btn("Đăng xuất thiết bị", func(): await Net.http("DELETE", "/api/auth/sessions/" + sid); w.root.queue_free(); _sessions()))
			w.body.add_child(row)
	w.body.add_child(UI.btn("Đăng xuất mọi thiết bị khác", func(): await Net.http("POST", "/api/auth/logout-all", {}); w.root.queue_free()))
	_popup(w.root)

func _change_pw() -> void:
	var w = UI.window("Đổi mật khẩu", 420, 260)
	var o = UI.edit("Mật khẩu cũ", true); var n := UI.edit("Mật khẩu mới", true)
	var st = UI.lbl("", 14, UI.RED, true)
	w.body.add_child(o); w.body.add_child(n)
	w.body.add_child(UI.btn("Đổi", func():
		var r = await Net.http("POST", "/api/auth/change-password", {"oldPassword": o.text, "newPassword": n.text})
		st.text = "Đã đổi mật khẩu" if r.status == 200 else Net.err_text(r)))
	w.body.add_child(st)
	_popup(w.root)

func _logout() -> void:
	await Net.http("POST", "/api/auth/logout", {})
	Net.token = ""
	main.show_login()
