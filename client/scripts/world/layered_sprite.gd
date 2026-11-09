class_name LayeredSprite
extends Node2D
## Nhân vật chibi phân lớp: thân/da, quần, áo, đai, mặt, tóc, vũ khí, thú cưỡi.
## Mỗi lớp là sheet 8×8 khung 64×96 dùng chung lưới -> thay trang bị chỉ đổi 1 lớp.

const ROWS := {"idle": 0, "run": 1, "jump": 2, "fall": 2, "attack": 3, "hurt": 4, "death": 5, "cast": 6, "meditate": 7}
const COUNTS := [4, 6, 2, 4, 2, 4, 4, 2]
const FPS := [5.0, 12.0, 4.0, 14.0, 8.0, 7.0, 10.0, 2.0]
const FASHION := {"fashion_white_robe": [2, "#f0f0f0"], "fashion_red_robe": [1, "#c03030"], "fashion_black_robe": [2, "#2a2a30"], "fashion_gold_robe": [2, "#e0b040"], "fashion_immortal": [2, "#c8e8ff"], "fashion_festival": [1, "#ff8030"]}
const MOUNTS := {"mount_horse": ["boar", "#8a6040"], "mount_wolf": ["wolf", "#3a3a4a"], "mount_crane": ["bird", "#f0f0f0"], "mount_qilin": ["tiger", "#ffd060"], "mount_dragon": ["dragon", "#6a4ac0"]}

var layers: Array[Sprite2D] = []
var mount_sprite: Sprite2D
var anim = "idle"
var frame = 0
var _t = 0.0
var facing = 1
var tint = Color.WHITE
var _body: Node2D

func _init() -> void:
	_body = Node2D.new()
	add_child(_body)

func _mk(tex: Texture2D, color := Color.WHITE) -> Sprite2D:
	var s = Sprite2D.new()
	s.texture = tex
	s.hframes = 8
	s.vframes = 8
	s.centered = false
	s.position = Vector2(-32, -94)
	s.modulate = color
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_body.add_child(s)
	layers.append(s)
	return s

func set_appearance(ap: Dictionary) -> void:
	for l in layers:
		l.queue_free()
	layers.clear()
	if mount_sprite:
		mount_sprite.queue_free()
		mount_sprite = null
	var outfit = int(ap.get("outfit", 0))
	var outfit_color = Color(str(ap.get("outfitColor", "#3a6aaa")))
	var f = ap.get("fashion")
	if f != null and FASHION.has(f):
		outfit = FASHION[f][0]
		outfit_color = Color(FASHION[f][1])
	var gender: String = str(ap.get("gender", "male"))
	_mk(Assets.tex("res://assets/characters/body_%s.png" % gender), Color(str(ap.get("skin", "#f2c9a0"))))
	_mk(Assets.tex("res://assets/characters/legs_%d.png" % outfit))
	_mk(Assets.tex("res://assets/characters/outfit_%d.png" % outfit), outfit_color)
	_mk(Assets.tex("res://assets/characters/belt_%d.png" % outfit))
	_mk(Assets.tex("res://assets/characters/face_%d_%d.png" % [int(ap.get("face", 0)), int(ap.get("eyes", 0))]))
	_mk(Assets.tex("res://assets/characters/hair_%d.png" % int(ap.get("hair", 0))), Color(str(ap.get("hairColor", "#1a1a1a"))))
	var w = Assets.weapon_tex(ap.get("weapon"))
	if w:
		_mk(w)
	var m = ap.get("mount")
	if m != null and MOUNTS.has(m):
		mount_sprite = Sprite2D.new()
		mount_sprite.texture = Assets.tex("res://assets/monsters/%s.png" % MOUNTS[m][0])
		mount_sprite.hframes = 4
		mount_sprite.vframes = 5
		mount_sprite.modulate = Color(MOUNTS[m][1]).lerp(Color.WHITE, 0.4)
		mount_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		mount_sprite.scale = Vector2(1.3, 1.3) if MOUNTS[m][0] != "dragon" else Vector2(0.75, 0.75)
		mount_sprite.position = Vector2(0, -40)
		add_child(mount_sprite)
		move_child(mount_sprite, 0)
		_body.position.y = -22
	else:
		_body.position.y = 0
	_apply()

func play(a: String) -> void:
	if not ROWS.has(a):
		a = "idle"
	if a == anim:
		return
	anim = a
	frame = 1 if a == "fall" else 0
	_t = 0.0
	_apply()

func set_facing(f: int) -> void:
	facing = 1 if f >= 0 else -1
	_body.scale.x = facing
	if mount_sprite:
		mount_sprite.flip_h = facing < 0

func _process(delta: float) -> void:
	var row: int = ROWS[anim]
	if anim == "fall" or anim == "jump":
		return
	_t += delta
	var step = 1.0 / FPS[row]
	if _t >= step:
		_t -= step
		if anim == "death":
			frame = min(frame + 1, COUNTS[row] - 1)
		else:
			frame = (frame + 1) % COUNTS[row]
		_apply()
	if mount_sprite:
		var mrow = 1 if anim == "run" else 0
		mount_sprite.frame = mrow * 4 + (Time.get_ticks_msec() / 150) % 4

func _apply() -> void:
	var row: int = ROWS[anim]
	var idx = row * 8 + clampi(frame, 0, COUNTS[row] - 1)
	for l in layers:
		l.frame = idx
	_body.modulate = tint
