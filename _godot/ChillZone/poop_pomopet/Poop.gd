extends Node2D

var held = false
var trashcanController
var poopController

var canHold = false
var currMousePosition = Vector2(50, 50)

func _ready():
	trashcanController = get_node("../Trashcan")
	poopController = get_node("../../PoopController")
	poopController.connect("poopPickUpEnd", self, "_on_poopPickUpEnd")
	poopController.connect("poopPickUpStart", self, "_on_poopPickUpStart")

func _process(delta):
	if Input.is_action_just_released("left_mouse_click"):
		dropPoop(Input.get_last_mouse_speed())
	
	if currMousePosition.y > 675 or currMousePosition.y < 5 or currMousePosition.x < 5 or currMousePosition.x > 1910: #Last region 
		dropPoop(Input.get_last_mouse_speed())

func _input(event):
	if event is InputEventMouseMotion:
		currMousePosition = event.position

func pickupPoop():
	if held and poopController.poopCurrentlyHeld != self and canHold and trashcanController.trashcanReady():
		return
	print("picked up")
	poopController.poopCurrentlyHeld = self
	$RigidBody2D.mode = RigidBody2D.MODE_STATIC
	held = true
	trashcanController.poopIsHeld = true

func dropPoop(impulse = Vector2.ZERO):
	if held and canHold and trashcanController.trashcanReady():
		print("dropping poop")
		$RigidBody2D.mode = RigidBody2D.MODE_RIGID
		$RigidBody2D.apply_central_impulse(impulse)
		held = false
		trashcanController.poopIsHeld = false
		poopController.poopCurrentlyHeld = null

func _physics_process(delta):
	if held and poopController.poopCurrentlyHeld == self and canHold and trashcanController.trashcanReady():
		$RigidBody2D.global_transform.origin = get_global_mouse_position()

func _on_RigidBody2D_input_event(viewport, event, shape_idx):
	if event is InputEventMouseButton:
		if event.button_index == BUTTON_LEFT and event.pressed:
			pickupPoop()

func _on_poopPickUpEnd():
	canHold = false

func _on_poopPickUpStart():
	canHold = true

func getRigidBody():
	return $RigidBody2D
