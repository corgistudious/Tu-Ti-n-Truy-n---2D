class_name MonsterSprite
extends Node2D
## Sprite quái theo nguyên mẫu, scale theo hitbox, đổi màu nhẹ theo từng loài để phân biệt.

const ROWS := {"idle": 0, "run": 1, "move": 1, "attack": 2, "cast": 2, "hurt": 3, "death": 4}
var spr = Sprite2D.new()
var anim = "idle"
var frame = 0
var _t = 0.0
var size = 64

func setup(sprite_key: String, monster_id: String, w: float, h: float, rank: int) -> void:
	var arche = sprite_key
	if not ResourceLoader.exists("res://assets/monsters/%s.png" % arche):
		arche = "slime"
	spr.texture = Assets.tex("res://assets/monsters/%s.png" % arche)
	size = 128 if arche == "dragon" else 64
	spr.hframes = 4
	spr.vframes = 5
	spr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	var sc: float = max(w, h) / (size * 0.72)
	spr.scale = Vector2(sc, sc)
	spr.position = Vector2(0, -size * sc / 2.0)
	# đổi sắc nhẹ theo id để các loài cùng nguyên mẫu khác nhau
	var hsh = monster_id.hash()
	var hue = float(hsh % 1000) / 1000.0
	spr.modulate = Color.from_hsv(hue, 0.25, 1.0).lerp(Color.WHITE, 0.55)
	if rank >= 3:
		spr.modulate = spr.modulate.lerp(Color("#ffb0b0"), 0.25)
	add_child(spr)

func play(a: String) -> void:
	var key = a if ROWS.has(a) else "idle"
	if key == anim:
		return
	anim = key
	frame = 0
	_t = 0

func set_facing(f: int) -> void:
	spr.flip_h = f < 0

func _process(delta: float) -> void:
	_t += delta
	if _t > 0.14:
		_t = 0
		var n = 2 if anim == "hurt" else 4
		frame = min(frame + 1, n - 1) if anim == "death" else (frame + 1) % n
	spr.frame = ROWS[anim] * 4 + frame
