extends Control

func _ready():
	$FadeIn.show()
	$FadeIn.fade_in()


func _on_FadeOut_fade_out_finished():
	if get_tree().change_scene('res://Menu/MenuScreen.tscn') != OK:
		print("Could not change to MenuScreen.tscn")

func _on_FadeIn_fade_in_finished():
	$FadeIn.hide()


func _on_DungeonFightTemporaryNavigation_pressed():
	get_tree().change_scene('res://dungeon_fight/dungeon_fight.tscn')


func _on_PomoBlast_pressed():
	get_tree().change_scene('res://PomoBlast/PomoBlast.tscn')
	
	pass # Replace with function body.


func _on_Back_Button_pressed():
	$FadeOut.show()
	$FadeOut.fade_out()

#Button Click for Dungeon_Fight Details
func _on_dungeon_fight_Details_Button_pressed():
	$Game_Selection/VSplit_Game_Container/Game_Details_Label.text = ondungeonDetails()


func _on_Pomoblast_Details_Button_pressed():
	$Game_Selection/VSplit_Game_Container/Game_Details_Label.text = pomoblastDetails()

#Text for Dungeon_Fight Details
func ondungeonDetails():
	var text ="Title: Dungeon Fight \n\nCreated By: Noah Stinson\n\nDescription: Fight your way out of the dungeon and to success!\n\nControls: Mouse Clicks\n\nObjective: Answer as many questions correct as you can before time runs out. If you answer incorrectly or not in time you will take damage each time, eventually getting KO'ed"
	return text
	
#Text for PomoBlast Details
func pomoblastDetails():
	var text ="Title: PomoBlast \n\nCreated By: Eliss Glasper\n\nDescription: Fight your way through the pomogranates before they destroy YOU and your CREW!\n\nControls: Mouse Clicks - To Fire\nArrow Keys - To Move\n\nObjective: Destroy as many enemies as you can before!!"
	return text
#Text for Toggle On Dungeon
func ondungeonSelectedOn():
	var text="\nDungeon_Fight\n"
	return text
	
#Text for Toggle Off Dungeon
func ondungeonSelectedOff():
	var text="\n\n"
	return text

#Text for Toggle On Pomoblast
func onpomoblastSelectedOn():
	var text="\nPomoblast\n"
	return text

#Text for Toggle Off Pomoblast
func onpomoblastSelectedOff():
	var text="\nOff\n"
	return text

#Dungeon Selector Clicked
func _on_dungeon_fight_Selection_pressed():
	$Game_Selection/VSplit_Game_Container/Games_Selection_Label.text+=ondungeonSelectedOn()
	
#Pomoblast Selector Clicked
func _on_Pomoblast_Selection_pressed():
	$Game_Selection/VSplit_Game_Container/Games_Selection_Label.text+=onpomoblastSelectedOn()
