extends Node2D

var bunnySprite = load("res://ChillZone/pet/pet_sprites/bunny_sprite.png")
var catSprite = load("res://ChillZone/pet/pet_sprites/cat_sprite.png")
var dogSprite = load("res://ChillZone/pet/pet_sprites/rembo_sprite.png")

var petWashingModeOn = true #TODO: Change to false 

var mouseIsDown = false
var withinSpriteCollisionPolygon = false
var lastMouseMovePos
var currentMouseMovePos

var startDirtinessLevel
var startDirtinessValue

var dirtyLevels = [1.0, 0.8, 0.6, 0.4, 0.2, 0] # , 0 == Fully Dirty, 1 == Fully Clean
var progressBarMaxValue = 20

# Called when the node enters the scene tree for the first time.
func _ready():
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	var currentPet = userDocFields["pomopet"]["type"]
	var pomopetData = userDocFields["pomopetData"]
	print("currentPet, ", currentPet)
	print("pomopetData, ", pomopetData)
	
	# TODO: Disable clean pet button if dirty level is at 0
	
	updatePomopetSprite(currentPet)
	startDirtinessLevel = getDirtinessLevel(pomopetData["lastWashed"])
	print(startDirtinessLevel)
	startDirtinessValue = dirtyLevels[startDirtinessLevel]
	setPetDirtinessLevel(startDirtinessLevel)
	$WashMeter/WashMeterProgressBar.setMaxValue(progressBarMaxValue * startDirtinessLevel)
	$WashMeter/WashMeterProgressBar.reset()

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_just_pressed("left_mouse_click"):
		mouseIsDown = true
	elif Input.is_action_just_released("left_mouse_click"):
		mouseIsDown = false
	
	if mouseIsDown and petWashingModeOn and withinSpriteCollisionPolygon:
		if getScrubIntensity() > 1.5:
			$WashMeter/WashMeterProgressBar.incrementByStep()
			# Update the pet dirtiness (how much was already clean + how much we have cleaned so far)
			var remainingValueRangeToClean = 1 - dirtyLevels[startDirtinessLevel]
			var newDirtinessValue = dirtyLevels[startDirtinessLevel] + remainingValueRangeToClean * $WashMeter/WashMeterProgressBar.getPercentageComplete()
			setPetDirtiness(newDirtinessValue)
			
			# Check if we are done washing
			if newDirtinessValue == 1:
				petWashingModeOn = false

# For tracking the distance between mouse positions
#	to determine "scrub intensity" (i.e. greater distance between mouse polls
#	means higher scrub intensity)
func _input(event):
	if event is InputEventMouseButton:
		lastMouseMovePos = event.position
		currentMouseMovePos = event.position
	if mouseIsDown and event is InputEventMouseMotion:
		currentMouseMovePos = event.position

# Set the dirtiness based off of preset dirty levels
func setPetDirtinessLevel(dirtinessLevel):
	$Sprite.material.set_shader_param("dissolve_amount", dirtyLevels[dirtinessLevel])
	
# Set the exact dirtiness level (Fully Dirty [0f] - Fully Clean [1f])
func setPetDirtiness(dirtinessValue):
	$Sprite.material.set_shader_param("dissolve_amount", dirtinessValue)

func getDirtinessLevel(lastTimeWashedMs):
	var timeSinceLastWashMs = OS.get_system_time_msecs() - lastTimeWashedMs # currentTime - lastTimeWashed
	var timeSinceLastWashDay = timeSinceLastWashMs / 1000 / 60 / 60 / 24 # time / ms / seconds / hour / day
	
	if timeSinceLastWashDay > 5:
		return 5
		
	return timeSinceLastWashDay

func updatePomopetSprite(petType):
	if petType == "bunny":
		$Sprite.texture = bunnySprite
	elif petType == "dog":
		$Sprite.texture = dogSprite
	elif petType == "cat":
		$Sprite.texture = catSprite

func getScrubIntensity():
	#if lastMouseMovePos == null or currentMouseMovePos == null:
	#	return 0
	
	var scrubIntensity = getDistanceBetweenMousePositions(lastMouseMovePos, currentMouseMovePos)
	lastMouseMovePos = currentMouseMovePos
	return scrubIntensity

func getDistanceBetweenMousePositions(pos1, pos2):
	return pow(pow(pos1.x - pos2.x, 2) + pow(pos1.y - pos2.y, 2), 0.5)


func _on_ClickDetection_mouse_entered():
	withinSpriteCollisionPolygon = true


func _on_ClickDetection_mouse_exited():
	withinSpriteCollisionPolygon = false
