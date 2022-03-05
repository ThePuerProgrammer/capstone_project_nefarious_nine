extends KinematicBody2D
export(PackedScene) var Bullet = preload("res://Bullet.tscn")

export (int) var speed = 200
var screenSize


var velocity = Vector2()

func _ready():
	screenSize = get_viewport_rect().size
	hide()
	pass
	


func get_input():
	velocity = Vector2()
	if Input.is_action_pressed('right'):
		velocity.x += 1
	if Input.is_action_pressed('left'):
		velocity.x -= 1
	if Input.is_action_pressed('down'):
		velocity.y += 1
	if Input.is_action_pressed('up'):
		velocity.y -= 1
	velocity = velocity.normalized() * speed
	
	if Input.is_action_pressed("shoot"):
		shoot()
	if Input.is_action_pressed("dash"):
		velocity = velocity * 5
		
		

func _physics_process(delta):
	look_at(get_global_mouse_position())
	get_input()
	velocity = move_and_slide(velocity)
	
	
func shoot():
	var b = Bullet.instance()
	
	owner.add_child(b) 
	b.transform = $Muzzle.global_transform
func start(pos):
	position= pos
	show()
	pass

	
	

