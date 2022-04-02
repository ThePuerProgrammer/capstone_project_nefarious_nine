extends Node2D


# Declare member variables here. Examples:
# var a = 2
# var b = "text"


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _process(delta):
	if Input.is_action_just_pressed("left_mouse_click"):
		startPour()
	elif Input.is_action_just_released("left_mouse_click"):
		endPour()

func hideFoodBag():
	$FoodBag.hide()

func showFoodBag():
	$FoodBag.show()
	
func startPour():
	$BagIdle.hide();
	$BagActive.show()
	
func endPour():
	$BagActive.hide()
	$BagIdle.show();

