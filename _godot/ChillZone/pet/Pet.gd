extends Node2D

var bunnySprite = load("res://ChillZone/pet/pet_sprites/bunny_sprite.png")
var catSprite = load("res://ChillZone/pet/pet_sprites/bunny_sprite.png")
var remmySprite = load("res://ChillZone/pet/pet_sprites/rembo_sprite.png")


var dirtyLevels = [1, 0.8, 0.6, 0.4, 0.2, 0] #[0] = fully clean and [last index] = full dirty
var dirtyLevelIndex = 0

# Called when the node enters the scene tree for the first time.
func _ready():
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	var currentPet = userDocFields["pomopet"]["type"]
	var pomopetData = userDocFields["pomopetData"]
	print("currentPet, ", currentPet)
	print("pomopetData, ", pomopetData)
	
	setPetDirtiness(getDirtinessLevel(pomopetData["lastWashed"]))

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_just_pressed("pomo_blast_dash"):
		dirtyLevelIndex = (dirtyLevelIndex + 1) % dirtyLevels.size()
		setPetDirtiness(dirtyLevelIndex)

func setPetDirtiness(dirtinessLevel):
	$Sprite.material.set_shader_param("dissolve_amount", dirtyLevels[dirtinessLevel])

func getDirtinessLevel(lastTimeWashedMs):
	var timeSinceLastWashMs = OS.get_system_time_msecs() - lastTimeWashedMs # currentTime - lastTimeWashed
	var timeSinceLastWashDay = timeSinceLastWashMs / 1000 / 60 / 60 / 24 # time / ms / seconds / hour / day
	
	if timeSinceLastWashDay > 5:
		return 5
		
	return timeSinceLastWashDay
