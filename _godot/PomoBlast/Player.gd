extends KinematicBody2D
export(PackedScene) var Bullet = preload("res://PomoBlast/Bullet.tscn")

export (int) var speed = 350
var screenSize
onready var bulletcooldownTimer  := $BulletCooldownTimer
onready var DashTimer  := $DashTimer


var velocity = Vector2()

func _ready():
	screenSize = get_viewport_rect().size
	hide()
	
	


func get_input():
	velocity = Vector2()
	if Input.is_action_pressed("pomo_blast_right"):
		velocity.x += 1
	if Input.is_action_pressed("pomo_blast_left"):
		velocity.x -= 1
	if Input.is_action_pressed("pomo_blast_down"):
		velocity.y += 1
	if Input.is_action_pressed("pomo_blast_up"):
		velocity.y -= 1
	velocity = velocity.normalized() * speed
	
		
	if Input.is_action_pressed("pomo_blast_shoot") and bulletcooldownTimer.is_stopped():
		shoot()
	if Input.is_action_pressed("pomo_blast_dash") and DashTimer.is_stopped():
		dash(velocity)
		

func _physics_process(delta):
	
	look_at(get_global_mouse_position())
	get_input()
	velocity = move_and_slide(velocity)
	
	
func shoot():
	var b = Bullet.instance()
	
	owner.add_child(b) 
	b.transform = $Muzzle.global_transform
	bulletcooldownTimer.start()
	
func start(pos):
	position= pos
	show()

func dash(vel):
		velocity = velocity * 100
		DashTimer.start()

func _on_Area2D_body_entered(body):
	if body.is_in_group("mobs"):
		self.queue_free()
	pass
	
