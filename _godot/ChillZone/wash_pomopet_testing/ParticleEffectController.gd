extends Node2D

var pomopet
var bubblesParticle = preload("res://ChillZone/wash_pomopet_testing/MouseBubblesParticle.tscn")
var bubblesOnCooldown = false

# Called when the node enters the scene tree for the first time.
func _ready():
	pomopet = get_node("../Pomopet")

# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass

func _input(event):
	if !bubblesOnCooldown and pomopet.petWashingModeOn and pomopet.mouseIsDown and event is InputEventMouseMotion:
		var bubblesInstance = bubblesParticle.instance()
		bubblesInstance.position = event.position # set where particle effect appears (mouse pos)
		add_child(bubblesInstance)
		bubblesInstance.emitting = true # trigger particle effect
		bubblesOnCooldown = true
		$MouseBubblesCooldownTimer.start()


func _on_MouseBubblesCooldownTimer_timeout(): # bubble cooldown resets when timer finishes
	bubblesOnCooldown = false
