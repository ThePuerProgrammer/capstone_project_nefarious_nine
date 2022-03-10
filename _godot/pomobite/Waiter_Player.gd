extends KinematicBody2D

export var move_speed = 300.0

func _ready():
	pass

func _physics_process(delta):
	process_movement()
	process_animation()

func process_movement():
	var horizontal 	= Input.get_axis("ui_left", "ui_right")
	var vertical   	= Input.get_axis("ui_up", "ui_down")
	var velocity	= Vector2()
	velocity.x += horizontal
	velocity.y += vertical
	velocity *= move_speed
	move_and_slide(velocity)
#	self.position.x += Input.get_axis("ui_left", "ui_right") * move_speed * delta
#	self.position.y += Input.get_axis("ui_up", "ui_down") * move_speed * delta

func process_animation():
	pass
