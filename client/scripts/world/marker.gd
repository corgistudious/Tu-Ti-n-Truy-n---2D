class_name Marker
extends Node2D
## Cổng dịch chuyển, điểm tài nguyên, điểm điều tra, vật phẩm rơi.

var kind = "portal"
var id = ""
var data = {}
var ready_at = 0
var icon: Texture2D
var t = 0.0
var label_text = ""
var font: Font

func _ready() -> void:
	font = load("res://assets/fonts/BeVietnamPro-SemiBold.ttf")

func _process(delta: float) -> void:
	t += delta
	queue_redraw()

func available() -> bool:
	return Time.get_ticks_msec() >= ready_at

func _draw() -> void:
	match kind:
		"portal":
			for i in 3:
				var r = 26.0 - i * 6 + sin(t * 3 + i) * 2
				draw_arc(Vector2(0, -40), r, t * (1 + i), t * (1 + i) + TAU * 0.75, 24, Color(0.5, 0.8, 1, 0.9 - i * 0.2), 3)
			draw_circle(Vector2(0, -40), 10, Color(0.8, 0.95, 1, 0.5))
		"node":
			var a = 1.0 if available() else 0.25
			if icon:
				draw_texture_rect(icon, Rect2(-16, -34 + sin(t * 2) * 2, 32, 32), false, Color(1, 1, 1, a))
			if available():
				draw_arc(Vector2(0, -18), 20, 0, TAU, 20, Color(1, 1, 0.6, 0.3 + 0.2 * sin(t * 4)), 2)
		"interact":
			for i in 4:
				var ang = t * 2 + i * TAU / 4
				draw_circle(Vector2(cos(ang) * 12, -30 + sin(ang) * 6), 2.5, Color(1, 0.9, 0.4, 0.9))
			draw_circle(Vector2(0, -30), 5, Color(1, 1, 0.7, 0.6))
		"drop":
			if icon:
				draw_texture_rect(icon, Rect2(-12, -26 + sin(t * 4) * 2, 24, 24), false)
			var rr = int(data.get("rarity", 0))
			if rr >= 2:
				draw_arc(Vector2(0, -14), 14, 0, TAU, 16, GameData.rarity_color(rr), 2)
	if label_text != "" and font:
		draw_string_outline(font, Vector2(-80, -70 if kind == "portal" else -44), label_text, HORIZONTAL_ALIGNMENT_CENTER, 160, 12, 3, Color.BLACK)
		draw_string(font, Vector2(-80, -70 if kind == "portal" else -44), label_text, HORIZONTAL_ALIGNMENT_CENTER, 160, 12, Color(0.9, 0.95, 1))
