extends Node2D


var dirtyLevels = [1, 0.8, 0.6, 0.4, 0.2, 0] #[0] = fully clean and [last index] = full dirty
var dirtyLevelIndex = 0

# Called when the node enters the scene tree for the first time.
func _ready():
	setPetDirtiness(dirtyLevelIndex)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_just_pressed("pomo_blast_dash"):
		dirtyLevelIndex = (dirtyLevelIndex + 1) % dirtyLevels.size()
		setPetDirtiness(dirtyLevelIndex)


func setPetDirtiness(dirtinessLevel):
	$Sprite.material.set_shader_param("dissolve_amount", dirtyLevels[dirtinessLevel])
