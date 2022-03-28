extends Node2D

var effectController

var bunnySprite = load("res://ChillZone/pet/pet_sprites/bunny_sprite.png")
var catSprite = load("res://ChillZone/pet/pet_sprites/cat_sprite.png")
var dogSprite = load("res://ChillZone/pet/pet_sprites/rembo_sprite.png")
var currentPet

var petWashingModeOn = true #TODO: Change to false 

var mouseIsDown = false
var withinDogCollisionPolygon = false
var withinCatCollisionPolygon = false
var withinBunnyCollisionPolygon = false
var lastMouseMovePos
var currentMouseMovePos

var startDirtinessLevel
var startDirtinessValue

var dirtyLevels = [1.0, 0.8, 0.6, 0.4, 0.2, 0] # , 0 == Fully Dirty, 1 == Fully Clean
var progressBarMaxValue = 20

# Called when the node enters the scene tree for the first time.
func _ready():
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	currentPet = userDocFields["pomopet"]["type"]
	var pomopetData = userDocFields["pomopetData"]
	
	effectController = get_node("../EffectController")
	
	# TODO: Disable clean pet button if dirty level is at 0
	
	updatePomopetSprite(currentPet)
	startDirtinessLevel = getDirtinessLevel(pomopetData["lastWashed"])
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
	
	if mouseIsDown and petWashingModeOn and isWithinPetTypeCollisionPolygon():
		if getScrubIntensity() > 1.5:
			$WashMeter/WashMeterProgressBar.incrementByStep()
			# Update the pet dirtiness (how much was already clean + how much we have cleaned so far)
			var remainingValueRangeToClean = 1 - dirtyLevels[startDirtinessLevel]
			var newDirtinessValue = dirtyLevels[startDirtinessLevel] + remainingValueRangeToClean * $WashMeter/WashMeterProgressBar.getPercentageComplete()
			setPetDirtiness(newDirtinessValue)
			
			# Check if we are done washing
			if newDirtinessValue == 1:
				effectController.playCleanEffects()
				hideCleaningProgressBar()
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

func showCleaningProgressBar():
	$WashMeter/WashMeterProgressBar/AnimationPlayer.play("fade_in")

func hideCleaningProgressBar():
	$WashMeter/WashMeterProgressBar/AnimationPlayer.play("fade_out")

func isWithinPetTypeCollisionPolygon():
	if currentPet == "bunny":
		return withinBunnyCollisionPolygon
	elif currentPet == "dog":
		return withinDogCollisionPolygon
	elif currentPet == "cat":
		return withinCatCollisionPolygon

func _on_BunnyClickDetection_mouse_entered():
	withinBunnyCollisionPolygon = true

func _on_BunnyClickDetection_mouse_exited():
	withinBunnyCollisionPolygon = false

func _on_CatClickDetection_mouse_entered():
	withinCatCollisionPolygon = true

func _on_CatClickDetection_mouse_exited():
	withinCatCollisionPolygon = false

func _on_DogClickDetection_mouse_entered():
	withinDogCollisionPolygon = true

func _on_DogClickDetection_mouse_exited():
	withinDogCollisionPolygon = false
