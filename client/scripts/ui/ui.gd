class_name UI
extends RefCounted
## Tiện ích dựng giao diện bằng mã (dễ bảo trì, thống nhất phong cách tiên hiệp).

const GOLD := Color("#e8c66a")
const PAPER := Color("#f3e9d2")
const DIM := Color("#a89c86")
const RED := Color("#ff6a5a")
const GREEN := Color("#7ee07e")
const BLUE := Color("#6ab0ff")

static var _theme: Theme

static func theme() -> Theme:
	if _theme:
		return _theme
	var t = Theme.new()
	var font: FontFile = load("res://assets/fonts/BeVietnamPro-SemiBold.ttf")
	if font:
		t.default_font = font
	t.default_font_size = 16
	var panel = StyleBoxFlat.new()
	panel.bg_color = Color(0.08, 0.07, 0.11, 0.94)
	panel.border_color = Color("#8a6a3a")
	panel.set_border_width_all(2)
	panel.set_corner_radius_all(6)
	panel.set_content_margin_all(10)
	t.set_stylebox("panel", "PanelContainer", panel)
	t.set_stylebox("panel", "Panel", panel)
	var bn = StyleBoxFlat.new()
	bn.bg_color = Color("#3a2a1c")
	bn.border_color = Color("#a07c44")
	bn.set_border_width_all(1)
	bn.set_corner_radius_all(4)
	bn.content_margin_left = 10; bn.content_margin_right = 10; bn.content_margin_top = 5; bn.content_margin_bottom = 5
	var bh = bn.duplicate(); bh.bg_color = Color("#5a4026")
	var bp = bn.duplicate(); bp.bg_color = Color("#22180f")
	var bd = bn.duplicate(); bd.bg_color = Color("#2a2622"); bd.border_color = Color("#5a5048")
	t.set_stylebox("normal", "Button", bn)
	t.set_stylebox("hover", "Button", bh)
	t.set_stylebox("pressed", "Button", bp)
	t.set_stylebox("disabled", "Button", bd)
	t.set_stylebox("focus", "Button", StyleBoxEmpty.new())
	t.set_color("font_color", "Button", PAPER)
	t.set_color("font_hover_color", "Button", GOLD)
	t.set_color("font_color", "Label", PAPER)
	var le = StyleBoxFlat.new()
	le.bg_color = Color(0, 0, 0, 0.55); le.border_color = Color("#6a5030"); le.set_border_width_all(1); le.set_corner_radius_all(3); le.set_content_margin_all(6)
	t.set_stylebox("normal", "LineEdit", le)
	t.set_stylebox("focus", "LineEdit", le)
	var pbg = StyleBoxFlat.new(); pbg.bg_color = Color(0, 0, 0, 0.6); pbg.set_corner_radius_all(3)
	t.set_stylebox("background", "ProgressBar", pbg)
	var tab = StyleBoxFlat.new(); tab.bg_color = Color("#2a2018"); tab.set_content_margin_all(6)
	var tabs = tab.duplicate(); tabs.bg_color = Color("#5a4026")
	t.set_stylebox("tab_unselected", "TabBar", tab)
	t.set_stylebox("tab_selected", "TabBar", tabs)
	t.set_stylebox("tab_hovered", "TabBar", tabs)
	t.set_stylebox("panel", "TabContainer", panel)
	t.set_stylebox("tab_unselected", "TabContainer", tab)
	t.set_stylebox("tab_selected", "TabContainer", tabs)
	t.set_stylebox("tab_hovered", "TabContainer", tabs)
	_theme = t
	return t

static func lbl(text: String, size := 16, color := PAPER, wrap := false) -> Label:
	var l = Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.9))
	l.add_theme_constant_override("outline_size", 3 if size >= 14 else 2)
	if wrap:
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return l

static func btn(text: String, cb: Callable, min_w := 0) -> Button:
	var b = Button.new()
	b.text = text
	b.focus_mode = Control.FOCUS_NONE
	if min_w > 0:
		b.custom_minimum_size.x = min_w
	b.pressed.connect(func(): Sfx.play("ui_click", 0.5); cb.call())
	return b

static func hbox(sep := 6) -> HBoxContainer:
	var h = HBoxContainer.new(); h.add_theme_constant_override("separation", sep); return h

static func vbox(sep := 6) -> VBoxContainer:
	var v = VBoxContainer.new(); v.add_theme_constant_override("separation", sep); return v

static func edit(placeholder: String, secret := false) -> LineEdit:
	var e = LineEdit.new(); e.placeholder_text = placeholder; e.secret = secret; e.custom_minimum_size = Vector2(260, 36); return e

static func bar(color: Color, w := 200, h := 14) -> ProgressBar:
	var p = ProgressBar.new()
	p.custom_minimum_size = Vector2(w, h)
	p.show_percentage = false
	var fill = StyleBoxFlat.new(); fill.bg_color = color; fill.set_corner_radius_all(3)
	p.add_theme_stylebox_override("fill", fill)
	return p

static func scroll(min_h := 300) -> ScrollContainer:
	var s = ScrollContainer.new()
	s.custom_minimum_size.y = min_h
	s.size_flags_vertical = Control.SIZE_EXPAND_FILL
	s.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	return s

static func clear(n: Node) -> void:
	for c in n.get_children():
		c.queue_free()

## Ô vật phẩm có icon, viền theo độ hiếm, số lượng
static func item_slot(item_id: String, qty := 1, extra := "", size := 44) -> PanelContainer:
	var p = PanelContainer.new()
	p.custom_minimum_size = Vector2(size, size)
	var sb = StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, 0.5)
	var def = GameData.items.get(item_id)
	sb.border_color = GameData.rarity_color(int(def.rarity)) if def else Color(0.3, 0.3, 0.3)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(3)
	sb.set_content_margin_all(2)
	p.add_theme_stylebox_override("panel", sb)
	if item_id != "":
		var tr = TextureRect.new()
		tr.texture = Assets.item_icon(item_id)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		p.add_child(tr)
		if qty > 1 or extra != "":
			var l = lbl(extra if extra != "" else str(qty), 11)
			l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
			l.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
			p.add_child(l)
		p.tooltip_text = item_tooltip(item_id)
	return p

static func item_tooltip(item_id: String, inst = null) -> String:
	var d = GameData.items.get(item_id)
	if d == null:
		return item_id
	var s = "%s\n[%s] %s\n" % [d.name, GameData.RARITY_NAMES[int(d.rarity)], d.type]
	if int(d.reqRealm) > 0:
		s += "Yêu cầu: %s\n" % GameData.realm_name(int(d.reqRealm))
	if d.has("stats"):
		for k in d.stats:
			s += "  %s +%s\n" % [stat_name(k), fmt_stat(k, d.stats[k])]
	if inst is Dictionary:
		if int(inst.get("e", 0)) > 0: s += "Cường hóa +%d\n" % int(inst.e)
		if int(inst.get("r", 0)) > 0: s += "Tinh luyện +%d\n" % int(inst.r)
		for a in inst.get("a", []):
			s += "  + %s +%s\n" % [stat_name(a.stat), fmt_stat(a.stat, a.value)]
		for g in inst.get("g", []):
			s += "  * %s\n" % GameData.item_name(g)
		if inst.get("d") != null: s += "Độ bền: %s\n" % str(inst.d)
		if inst.get("b", false): s += "(Khóa linh hồn)\n"
		if inst.get("l", false): s += "(Đã khóa)\n"
	s += d.desc
	return s

static func stat_name(k: String) -> String:
	return {"maxHp": "Sinh lực", "maxMp": "Chân khí", "atk": "Công vật lý", "matk": "Công pháp thuật", "def": "Phòng vật lý", "mdef": "Phòng pháp thuật", "crit": "Chí mạng", "critDmg": "ST chí mạng", "pen": "Xuyên giáp", "res": "Kháng", "moveSpeed": "Tốc độ", "hpRegen": "Hồi sinh lực", "mpRegen": "Hồi chân khí"}.get(k, k)

static func fmt_stat(k: String, v) -> String:
	if k in ["crit", "critDmg", "pen", "res", "moveSpeed"]:
		return "%.1f%%" % (float(v) * 100.0)
	return GameData.fmt(v)

## Cửa sổ tiêu chuẩn: tiêu đề + nút đóng + thân
static func window(title: String, w := 560, h := 440) -> Dictionary:
	var root = PanelContainer.new()
	root.custom_minimum_size = Vector2(w, h)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	var v = vbox(8)
	root.add_child(v)
	var head = hbox()
	var t = lbl(title, 20, GOLD)
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(t)
	var close = Button.new()
	close.text = "X"
	close.focus_mode = Control.FOCUS_NONE
	close.pressed.connect(func(): root.queue_free())
	head.add_child(close)
	v.add_child(head)
	var body = vbox(6)
	body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	v.add_child(body)
	return {"root": root, "body": body, "title": t}
