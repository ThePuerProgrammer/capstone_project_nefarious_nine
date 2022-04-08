extends Node2D

signal feedStart

export (int) var foodBowlDecrementByHours

var foodLevel0FGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_0_fg.png") # Full
var foodLevel0BGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_0_bg.png") # Full
var foodLevel1FGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_1_fg.png")
var foodLevel1BGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_1_bg.png")
var foodLevel2FGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_2_fg.png")
var foodLevel2BGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_2_bg.png")
var foodLevel3FGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_3_fg.png")
var foodLevel3BGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_3_bg.png")
var foodLevel4FGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_4_fg.png")
var foodLevel4BGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_4_bg.png")
var foodLevel5FGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_5_fg.png") # Empty
var foodLevel5BGTexture = load("res://ChillZone/food_pomopet/art/FoodBowls/food_bowl_5_bg.png") # Empty

var feedingModeOn = false
var lastFedMs

var currentMouseMovePos
var lastMouseMovePos
var mouseIsDown = false

var pomopet

var progressBarMaxValue = 20

# Called when the node enters the scene tree for the first time.
func _ready():
	pomopet = get_node("../../Pet")
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	lastFedMs = userDocFields["pomopetData"]["lastFed"]
	setFoodLevelByLastFed()
	
	if getFoodLevel() == 5:
		pomopet.setFeedButtonEnabled(false)
	
	# Initialize progress bar
	# 	20 points of progress to feed for every level of food missing
	$FeedMeter/FeedMeterProgressBar.setMaxValue(progressBarMaxValue * (5 - getFoodLevel()))
	$FeedMeter/FeedMeterProgressBar.setMaxValue(100)
	$FeedMeter/FeedMeterProgressBar.reset()

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_just_pressed("left_mouse_click"):
		mouseIsDown = true
	elif Input.is_action_just_released("left_mouse_click"):
		mouseIsDown = false
		
	
	if feedingModeOn:
		
		$FoodBag.global_position = get_global_mouse_position()
		
		setFoodBowlSprite(floor(getFoodLevel() + ((5 - getFoodLevel()) * $FeedMeter/FeedMeterProgressBar.getPercentageComplete())))
		
		# Mouse being shaken and is down
		if isPouringFood() and mouseIsDown:
			$FoodBag.spawnFoodAtRandomPoint()
			if $FoodBag/FoodBagShake.playing == false:
				$FoodBag/FoodBagShake.playing = true
		
		if $FeedMeter/FeedMeterProgressBar.getPercentageComplete() == 1:
			endFeedAction()
			

func _input(event):
	if event is InputEventMouseButton:
		lastMouseMovePos = event.position
		currentMouseMovePos = event.position
	if mouseIsDown and event is InputEventMouseMotion:
		currentMouseMovePos = event.position

func getDistanceBetweenMousePositions(pos1, pos2):
	return pow(pow(pos1.x - pos2.x, 2) + pow(pos1.y - pos2.y, 2), 0.5)

func getFoodLevel():
	var timeSinceLastFeed = OS.get_system_time_msecs() - lastFedMs # currentTime - lastTimeWashed
	var timePeriodsElapsed = floor(timeSinceLastFeed / 1000 / 60 / 60 / foodBowlDecrementByHours) # time / ms / seconds / hour / day
	
	if timePeriodsElapsed > 5:
		 timePeriodsElapsed = 5
	
	return 5 - timePeriodsElapsed

func setFoodLevelByLastFed():
	var timeSinceLastFeed = OS.get_system_time_msecs() - lastFedMs # currentTime - lastTimeWashed
	var timePeriodsElapsed = floor(timeSinceLastFeed / 1000 / 60 / 60 / foodBowlDecrementByHours) # time / ms / seconds / hour / day
	if timePeriodsElapsed > 5:
		timePeriodsElapsed = 5
	var foodLevel = 5 - timePeriodsElapsed
	setFoodBowlSprite(foodLevel)

func setFoodBowlSprite(foodLevel):
	if foodLevel == 0: # Food bowl is empty
		$FoodBowl/FoodBowlBg.texture = foodLevel0BGTexture
		$FoodBowl/FoodBowlFg.texture = foodLevel0FGTexture
	elif foodLevel == 1:
		$FoodBowl/FoodBowlBg.texture = foodLevel1BGTexture
		$FoodBowl/FoodBowlFg.texture = foodLevel1FGTexture
	elif foodLevel == 2:
		$FoodBowl/FoodBowlBg.texture = foodLevel2BGTexture
		$FoodBowl/FoodBowlFg.texture = foodLevel2FGTexture
	elif foodLevel == 3:
		$FoodBowl/FoodBowlBg.texture = foodLevel3BGTexture
		$FoodBowl/FoodBowlFg.texture = foodLevel3FGTexture
	elif foodLevel == 4:
		$FoodBowl/FoodBowlBg.texture = foodLevel4BGTexture
		$FoodBowl/FoodBowlFg.texture = foodLevel4FGTexture
	elif foodLevel >= 5: # Food bowl is full
		$FoodBowl/FoodBowlBg.texture = foodLevel5BGTexture
		$FoodBowl/FoodBowlFg.texture = foodLevel5FGTexture

func startFeedAction():
	feedingModeOn = true
	$FeedMeter/FeedMeterProgressBar/AnimationPlayer.play("fade_in")
	$FoodBag.showFoodBag()
	emit_signal("feedStart")

func endFeedAction():
	get_node("/root/FirebaseController").updateCurrentUserlastFed()
	feedingModeOn = false
	$FeedMeter/FeedMeterProgressBar/AnimationPlayer.play("fade_out")
	$FoodBag.hideFoodBag()
	# Clear all food pellets left over
	var foodPellets = get_tree().get_nodes_in_group("food_pellets")
	for f in foodPellets:
		f.destroyFoodPiece()
	pomopet.setFeedButtonEnabled(false)

func isPouringFood():
	var lastMouseDistance = getDistanceBetweenMousePositions(lastMouseMovePos, currentMouseMovePos)
	var mouseMoveDirection = currentMouseMovePos - lastMouseMovePos
	lastMouseMovePos = currentMouseMovePos
	
	return lastMouseDistance > 1.5 and mouseMoveDirection.y < 0 and mouseMoveDirection.x > 0


func _on_FoodPieceKillBox_body_entered(body):
	if feedingModeOn:
		body.queue_free()
		$FeedMeter/FeedMeterProgressBar.incrementByStep()

func _on_FoodPieceDespawnZone_body_entered(body):
	if feedingModeOn and body.get_collision_layer() == 16:
		body.destroyFoodPiece()


func _on_Pet_feedButtonPressed():
	startFeedAction()
