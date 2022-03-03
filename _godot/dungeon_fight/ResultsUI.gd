extends Control

var _correctNumberLabel
var _incorrectNumberLabel
var _pomocoinsLabel

func _ready():
	_correctNumberLabel = $ResultsPanelContainer/MarginContainer/MainColumn/MainContentHbox/LeftPanel/LeftPanelColumn/CorrectRow/correctAmount
	_incorrectNumberLabel = $ResultsPanelContainer/MarginContainer/MainColumn/MainContentHbox/LeftPanel/LeftPanelColumn/IncorrectRow/incorrectAmount
	_pomocoinsLabel = $ResultsPanelContainer/MarginContainer/MainColumn/MainContentHbox/RightPanel/RightPanelColumn/PomocoinsNumberText
	hide()

func showResults(playerWon, answeredCorrectly, answeredIncorrectly):
	show()
	_correctNumberLabel.text = str(answeredCorrectly)
	_incorrectNumberLabel.text = str(answeredIncorrectly)
	_pomocoinsLabel.text = str(answeredCorrectly * 2)
	$ShadowedBackground/AnimationPlayer.play("results_background_fade_in")\



func _on_AnimationPlayer_animation_finished(anim_name):
	$CoinSparkle1.show()
	$CoinSparkle2.show()
	$CoinSparkle1.play("sparkle")
	$CoinSparkle2.play("sparkle")
