extends Node
## Điều phối màn hình: Đăng nhập -> Chọn nhân vật -> Tạo nhân vật -> Thế giới.

var ui_layer = CanvasLayer.new()
var current: Node = null
var game: Node = null

func _ready() -> void:
	ui_layer.layer = 10
	add_child(ui_layer)
	get_window().min_size = Vector2i(800, 450)
	show_login()

func _set_screen(n: Control) -> void:
	if current:
		current.queue_free()
	current = n
	n.theme = UI.theme()
	n.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui_layer.add_child(n)

func show_login() -> void:
	if game:
		game.queue_free()
		game = null
	var s = preload("res://scripts/ui/login_screen.gd").new()
	s.main = self
	_set_screen(s)

func show_char_select() -> void:
	if game:
		game.queue_free()
		game = null
	var s = preload("res://scripts/ui/char_select.gd").new()
	s.main = self
	_set_screen(s)

func show_char_create() -> void:
	var s = preload("res://scripts/ui/char_create.gd").new()
	s.main = self
	_set_screen(s)

func enter_game(char_id: int) -> void:
	if current:
		current.queue_free()
		current = null
	game = preload("res://scripts/world/game.gd").new()
	game.main = self
	add_child(game)
	game.start(char_id)
