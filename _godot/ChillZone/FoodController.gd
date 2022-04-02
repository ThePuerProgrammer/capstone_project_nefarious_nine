extends Node2D

var foodLevel0Texture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_0.png") # Full
var foodLevel1Texture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_1.png")
var foodLevel2Texture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_2.png")
var foodLevel3Texture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_3.png")
var foodLevel4Texture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_4.png")
var foodLevel5Texture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_5.png")#Empty

var feedingModeOn = false
var lastFedMs

var currentMouseMovePos
var lastMouseMovePos
var mouseIsDown = false

# Called when the node enters the scene tree for the first time.
func _ready():
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	lastFedMs = userDocFields["pomopetData"]["lastFed"]
	setFoodLevelByLastFed()
	hideFoodBag()

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_just_pressed("left_mouse_click"):
		mouseIsDown = true
	elif Input.is_action_just_released("left_mouse_click"):
		mouseIsDown = false
	
	if feedingModeOn:
		$FoodBag.global_transform.origin = get_global_mouse_position()
		
		if isPouringFood() and mouseIsDown:
			$FoodBag/DogFoodParticles.emitting = true
		else:
			$FoodBag/DogFoodParticles.emitting = false

func _input(event):
	if event is InputEventMouseButton:
		lastMouseMovePos = event.position
		currentMouseMovePos = event.position
	if mouseIsDown and event is InputEventMouseMotion:
		currentMouseMovePos = event.position

func getDistanceBetweenMousePositions(pos1, pos2):
	return pow(pow(pos1.x - pos2.x, 2) + pow(pos1.y - pos2.y, 2), 0.5)

func setFoodLevelByLastFed():
	var timeSinceLastFeed = OS.get_system_time_msecs() - lastFedMs # currentTime - lastTimeWashed
	var foodLevel = timeSinceLastFeed / 1000 / 60 / 60 / 6 # time / ms / seconds / hour / day
	print("foodLevel: ", foodLevel)
	setFoodLevel(foodLevel)

func setFoodLevel(foodLevel):
	if foodLevel == 0:
		$BowlSprite.texture = foodLevel0Texture
	elif foodLevel == 1:
		$BowlSprite.texture = foodLevel1Texture
	elif foodLevel == 2:
		$BowlSprite.texture = foodLevel2Texture
	elif foodLevel == 3:
		$BowlSprite.texture = foodLevel3Texture
	elif foodLevel == 4:
		$BowlSprite.texture = foodLevel4Texture
	elif foodLevel >= 5:
		$BowlSprite.texture = foodLevel5Texture

func hideFoodBag():
	$FoodBag.hide()

func showFoodBag():
	$FoodBag.show()

func startFeedAction():
	feedingModeOn = true
	showFoodBag()

func isPouringFood():
	var lastMouseDistance = getDistanceBetweenMousePositions(lastMouseMovePos, currentMouseMovePos)
	lastMouseMovePos = currentMouseMovePos
	
	return lastMouseDistance > 1.5
