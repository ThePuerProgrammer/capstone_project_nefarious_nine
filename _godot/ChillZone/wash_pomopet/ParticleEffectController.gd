extends Node2D

var pomopet
var bubblesParticle = preload("res://ChillZone/wash_pomopet/MouseBubblesParticle.tscn")
var cleanGlowParticle = preload("res://ChillZone/wash_pomopet/CleanGlowParticle.tscn")
var bubblesOnCooldown = false

# Called when the node enters the scene tree for the first time.
func _ready():
	pomopet = get_node("../../../Pet")
	$CleanSparkle.modulate.a = 0
	$CleanSparkle.play("sparkle")

func _process(_delta):
	if $CleanGlowParticle.emitting:
		# Move effects to player location
		$CleanGlowParticle.global_position = Vector2(pomopet._getCurrentKinematicBody().global_position.x, pomopet._getCurrentKinematicBody().global_position.y + 25)
		$CleanSparkle.global_position = pomopet._getCurrentKinematicBody().global_position
		
	

func _input(event):
	if !bubblesOnCooldown and pomopet.petWashingModeOn and pomopet.mouseIsDown and pomopet.isWithinPetTypeCollisionPolygon() and event is InputEventMouseMotion:
		var bubblesInstance = bubblesParticle.instance()
		bubblesInstance.position = event.position # set where particle effect appears (mouse pos)
		add_child(bubblesInstance)
		bubblesInstance.emitting = true # trigger particle effect
		bubblesOnCooldown = true
		if $BubbleSoundEffect.playing == false:
			$BubbleSoundEffect.play()
		$MouseBubblesCooldownTimer.start()


func _on_MouseBubblesCooldownTimer_timeout(): # bubble cooldown resets when timer finishes
	bubblesOnCooldown = false

# Starts clean effect animations
func playCleanEffects():
	# Start effects
	# 	Glow Effect
	$CleanGlowParticle.emitting = true
	# 	Sparkle Effect
	$CleanSparkle/AnimationPlayer.play("sparkle_fade_in")
	
	# Start effect timer
	$CleanEffectTimer.start()
	$CleanSoundEffect.play()


# Ends clean effect animations
func _on_CleanEffectTimer_timeout():
	# Turn off effects
	$CleanGlowParticle.emitting = false
	$CleanSparkle/AnimationPlayer.play("sparkle_fade_out")
