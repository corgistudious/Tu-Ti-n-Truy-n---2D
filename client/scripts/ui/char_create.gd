extends Control
## Tạo nhân vật: giới tính, kiểu tóc, màu tóc, khuôn mặt, mắt, màu da, trang phục, màu áo, tên.

var main
var ap = {"gender": "male", "hair": 2, "hairColor": "#1a1a1a", "face": 1, "eyes": 1, "skin": "#f2c9a0", "outfit": 0, "outfitColor": "#3a6aaa"}
var opts = {"hair": 6, "face": 4, "eyes": 4, "outfit": 4, "hairColors": ["#1a1a1a", "#4a2a1a", "#8a5a2a", "#d8c08a", "#c0c0c8", "#7a2a2a", "#2a3a6a", "#3a6a4a"], "skins": ["#f6d7b8", "#f2c9a0", "#e0ac7e", "#c58c5c", "#8d5a3b"], "outfitColors": ["#3a6aaa", "#aa3a3a", "#3a8a5a", "#6a4a8a", "#c0a040", "#dadada", "#2a2a2a", "#d07a9a"]}
var preview: LayeredSprite
var name_edit: LineEdit
var status: Label
var anims = ["idle", "run", "attack", "cast", "jump"]
var anim_i = 0

func _ready() -> void:
	var bg = ColorRect.new(); bg.color = Color(0.06, 0.05, 0.09); bg.set_anchors_preset(Control.PRESET_FULL_RECT); add_child(bg)
	var r = await Net.http("GET", "/api/data/appearance-options")
	if r.status == 200:
		opts = r.data
	var margin = MarginContainer.new(); margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	for s in ["left", "right", "top", "bottom"]: margin.add_theme_constant_override("margin_" + s, 24)
	add_child(margin)
	var h = UI.hbox(24); margin.add_child(h)
	var panel = PanelContainer.new(); panel.custom_minimum_size.x = 460; h.add_child(panel)
	var v = UI.vbox(8); panel.add_child(v)
	v.add_child(UI.lbl("Tạo Nhân Vật", 26, UI.GOLD))
	name_edit = UI.edit("Tên nhân vật (2–14 ký tự)")
	v.add_child(name_edit)
	var g = UI.hbox()
	g.add_child(UI.btn("Nam", func(): ap.gender = "male"; ap.hair = 2; _refresh()))
	g.add_child(UI.btn("Nữ", func(): ap.gender = "female"; ap.hair = 4; _refresh()))
	v.add_child(g)
	for key in [["hair", "Kiểu tóc"], ["face", "Khuôn mặt"], ["eyes", "Đôi mắt"], ["outfit", "Trang phục"]]:
		v.add_child(_stepper(key[0], key[1], int(opts[key[0]])))
	v.add_child(_swatches("hairColor", "Màu tóc", opts.hairColors))
	v.add_child(_swatches("skin", "Màu da", opts.skins))
	v.add_child(_swatches("outfitColor", "Màu áo", opts.outfitColors))
	var row = UI.hbox()
	row.add_child(UI.btn("Tạo nhân vật", _create, 160))
	row.add_child(UI.btn("Quay lại", func(): main.show_char_select()))
	v.add_child(row)
	status = UI.lbl("", 14, UI.RED, true)
	v.add_child(status)
	var pv = Control.new(); pv.size_flags_horizontal = Control.SIZE_EXPAND_FILL; h.add_child(pv)
	preview = LayeredSprite.new()
	preview.scale = Vector2(5, 5)
	preview.position = Vector2(260, 560)
	pv.add_child(preview)
	var anim_btn = UI.btn("Đổi động tác", func(): anim_i = (anim_i + 1) % anims.size(); preview.play(anims[anim_i]))
	anim_btn.position = Vector2(180, 600)
	pv.add_child(anim_btn)
	_refresh()
	if Config.autotest:
		name_edit.text = "Test%d" % (randi() % 100000)
		_create.call_deferred()

func _stepper(key: String, label: String, n: int) -> HBoxContainer:
	var hb = UI.hbox()
	var l = UI.lbl(label, 16); l.custom_minimum_size.x = 110; hb.add_child(l)
	var val = UI.lbl("", 16, UI.GOLD); val.custom_minimum_size.x = 50
	hb.add_child(UI.btn("<", func(): ap[key] = (int(ap[key]) - 1 + n) % n; val.text = str(int(ap[key]) + 1); _refresh()))
	hb.add_child(val)
	hb.add_child(UI.btn(">", func(): ap[key] = (int(ap[key]) + 1) % n; val.text = str(int(ap[key]) + 1); _refresh()))
	val.text = str(int(ap[key]) + 1)
	return hb

func _swatches(key: String, label: String, colors: Array) -> HBoxContainer:
	var hb = UI.hbox(4)
	var l = UI.lbl(label, 16); l.custom_minimum_size.x = 110; hb.add_child(l)
	for c in colors:
		var b = Button.new()
		b.custom_minimum_size = Vector2(28, 28)
		var sb = StyleBoxFlat.new(); sb.bg_color = Color(c); sb.set_corner_radius_all(4); sb.border_color = Color.WHITE; sb.set_border_width_all(1)
		b.add_theme_stylebox_override("normal", sb)
		b.add_theme_stylebox_override("hover", sb)
		b.focus_mode = Control.FOCUS_NONE
		b.pressed.connect(func(): ap[key] = c; _refresh())
		hb.add_child(b)
	return hb

func _refresh() -> void:
	preview.set_appearance(ap)
	preview.play(anims[anim_i])

func _create() -> void:
	var r = await Net.http("POST", "/api/characters", {"name": name_edit.text.strip_edges(), "appearance": ap})
	if r.status != 200:
		status.text = Net.err_text(r)
		return
	main.enter_game(int(r.data.id))
