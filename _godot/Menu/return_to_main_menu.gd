extends Control

func _ready():
	
	$FadeIn.show()
	$FadeIn.fade_in()

func _on_FadeOut_fade_out_finished():
	if get_tree().change_scene('res://Menu/MenuScreen.tscn') != OK:
		print("Could not change to MenuScreen.tscn")

func _on_backButton_pressed():
	$FadeOut.show()
	$FadeOut.fade_out()

func _on_FadeIn_fade_in_finished():
	$FadeIn.hide()


func _on_DungeonFightTemporaryNavigation_pressed():
	get_tree().change_scene('res://dungeon_fight/dungeon_fight.tscn')
