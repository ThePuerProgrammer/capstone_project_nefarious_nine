extends Node2D

var foodPieceScene = preload("res://ChillZone/food_pomopet/FoodPiece.tscn")

var canSpawnFoodPiece = true

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _process(_delta):
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

func spawnFoodAtRandomPoint():
	if !canSpawnFoodPiece:
		return
	
	randomize()
	var randTexturePicker = floor(rand_range(0, 5)) # rand number 0 - 4
	var nodeString = "FoodSpawnPositions/FoodSpawnPos{randNum}"
	var spawnPosition = get_node(nodeString.format({"randNum": randTexturePicker})).global_transform.origin
	
	var foodPieceInstance = foodPieceScene.instance()
	foodPieceInstance.global_transform.origin = global_transform.origin
	get_node("../FoodPieces").add_child(foodPieceInstance)
	canSpawnFoodPiece = false
	$FoodPieceSpawnCooldown.start()


func _on_FoodPieceSpawnCooldown_timeout():
	canSpawnFoodPiece = true
