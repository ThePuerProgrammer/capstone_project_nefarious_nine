extends Control


# Declare member variables here. Examples:
# var a = 2
# var b = "text"


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass


func _on_RadioButton_pressed():
	if $RadioMusic.playing == true:
		$RadioMusic.playing = false
		$MusicNotes.emitting = false
	else:
		$RadioMusic.playing = true
		$MusicNotes.emitting = true

