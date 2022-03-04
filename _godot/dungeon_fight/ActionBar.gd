extends VBoxContainer

export (Texture) var _block_tex
export (Texture) var _attack_tex
export (Texture) var _dodgeLeft_tex
export (Texture) var _dodgeRight_tex

func _ready():
	$CenterContainer/Panel/ActionSprite.texture = _attack_tex
	
func updateActionSprite(currentAction):
	var _newTex
	
	if currentAction == "attack":
		_newTex = _attack_tex
	elif currentAction == "dodge":
		_newTex = _dodgeLeft_tex
		
	$CenterContainer/Panel/ActionSprite.texture = _newTex
