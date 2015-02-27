
using UnityEngine;
using System.Collections;


public class PalyerAttrybute : MonoBehaviour {
	public GUISkin mySkin;
	
	private GameObject Player;
	
	private  float closeButtonwidth = 20;
	private  float closeButtonheight = 20;
	
	private PlayerCharacter _toon;
	private const int STARTING_POINTS=50;
	private const int MIN_STARTING_ATTRIBUTE_VALUE=10;
	private const int STARTING_VALUE=15;
	private int pointsLeft;
	
	private const int OFFSET_X=10;
	private const int OFFSET_Y=25;
	private const int BUTTON_WIDTH=20;
	private const int BUTTON_HEIGHT=20;
	private const int LABEL_WIDTH=40;
	private const int LABEL_HEIGHT=20;
	
	public GameObject PlayerPrafab;
	
	/***************************************/
    /* Character window variable */
	/***************************************/
	private bool _displayCharacterWindow = false;
	private const int CHARACTER_WINDOW_ID = 1;
	private Rect _characterWindowRect = new Rect(10,Screen.height/8,360,458);

	
	// Use this for initialization
	void Start () {

		Player = GameObject.FindGameObjectWithTag("Player");
		
		_toon=Player.GetComponent<PlayerCharacter>();
			
		pointsLeft=STARTING_POINTS;
			
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
		{
			_toon.GetPrimaryAttribute(cnt).BaseValue=STARTING_VALUE;
			pointsLeft-=(STARTING_VALUE-MIN_STARTING_ATTRIBUTE_VALUE);
		}
	}
	
	// Update is called once per frame
	void Update () {
		
		if(_displayCharacterWindow)
		{
			if(Input.GetKeyUp(KeyCode.C)){	
			_displayCharacterWindow = false;
		    }
		}
		else
		{
			if(Input.GetKeyUp(KeyCode.C)){	
			_displayCharacterWindow = true;
		    }
		}
		_toon.StatUpdate();
	}
	
	void OnGUI()
	{
		GUI.skin=mySkin;
		if(_displayCharacterWindow)
			_characterWindowRect = GUI.Window(CHARACTER_WINDOW_ID,_characterWindowRect,CharacterWindow,"","Character");
		
	}
	
	public void CharacterWindow(int id)
	{
		if(GUI.Button (new Rect(_characterWindowRect.width-30,18, closeButtonwidth, closeButtonheight), "","closeButton")){
			_displayCharacterWindow = false;
		}
		DisplayName();
		DisplayPointsLeft();
		DisAttributes();
		
		DisplayVitals();
		
		DisplaySkills();
		if(_toon.Name == ""||pointsLeft > 0)
			DisplayCreatLabel();
		else
		    DisplayCreatButton();
			
		GUI.DragWindow();
	}
	
	private void DisplayName()
	{
		//"在属性窗口显示角色名称"
		GUI.Label(new Rect(OFFSET_X,60+(OFFSET_Y*1),LABEL_WIDTH,LABEL_HEIGHT),"名称：","gold");
		_toon.Name=GUI.TextArea(new Rect(OFFSET_X+40,60+(OFFSET_Y*1),LABEL_WIDTH*2,LABEL_HEIGHT),_toon.Name);
	}
	
	private void DisAttributes()
	{
		//"在属性窗口显示角色属性"
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*2),LABEL_WIDTH,LABEL_HEIGHT),"力量：","green");
		//GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*2),LABEL_WIDTH,LABEL_HEIGHT),might);
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*3),LABEL_WIDTH,LABEL_HEIGHT),"体质：","green");
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*4),LABEL_WIDTH,LABEL_HEIGHT),"敏捷：","green");
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*5),LABEL_WIDTH,LABEL_HEIGHT),"速度：","green");
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*6),LABEL_WIDTH,LABEL_HEIGHT),"精神：","green");
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*7),LABEL_WIDTH,LABEL_HEIGHT),"毅力：","green");
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*8),LABEL_WIDTH,LABEL_HEIGHT),"魅力：","green");
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
		{
			//GUI.Label(new Rect(20,110+(cnt*25),100,25),((AttributeName)cnt).ToString()+":","green");
			GUI.TextArea(new Rect(OFFSET_X+40,112+(cnt*OFFSET_Y),LABEL_WIDTH,LABEL_HEIGHT),_toon.GetPrimaryAttribute(cnt).AdjustedBaseValue.ToString());
			if(GUI.Button(new Rect(OFFSET_X+85,112+(cnt*OFFSET_Y),BUTTON_WIDTH,BUTTON_HEIGHT),"-"))
			{
				if(pointsLeft>0)
				{
					if(_toon.GetPrimaryAttribute(cnt).BaseValue>MIN_STARTING_ATTRIBUTE_VALUE)
					{
					    _toon.GetPrimaryAttribute(cnt).BaseValue--;
					    pointsLeft++;
						_toon.StatUpdate();
					}
				}
			}
			if(GUI.Button(new Rect(OFFSET_X+110,112+(cnt*OFFSET_Y),BUTTON_WIDTH,BUTTON_HEIGHT),"+"))
			{
				if(pointsLeft>0)
				{
					_toon.GetPrimaryAttribute(cnt).BaseValue++;
					pointsLeft--;
					_toon.StatUpdate();
				}
			}
		}
	}
	
	private void DisplayVitals()
	{
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*2),LABEL_WIDTH,LABEL_HEIGHT),"气血：","orange");
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*3),LABEL_WIDTH,LABEL_HEIGHT),"魔力：","orange");
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*4),LABEL_WIDTH,LABEL_HEIGHT),"威望：","orange");
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(VitalName)).Length;cnt++)
		{
			GUI.Label(new Rect(240,110+(cnt*OFFSET_Y),LABEL_WIDTH,LABEL_HEIGHT),_toon.GetVital(cnt).AdjustedBaseValue.ToString());
		}
	}
	
	private void DisplaySkills()
	{
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*5),LABEL_WIDTH,LABEL_HEIGHT),"混乱攻击：","red");
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*6),LABEL_WIDTH,LABEL_HEIGHT),"混乱抗性：","red");
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*7),LABEL_WIDTH,LABEL_HEIGHT),"远程攻击：","red");
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*8),LABEL_WIDTH,LABEL_HEIGHT),"远程防御：","red");
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*9),LABEL_WIDTH,LABEL_HEIGHT),"魔法攻击：","red");
		GUI.Label(new Rect(180+OFFSET_X,65+(OFFSET_Y*10),LABEL_WIDTH,LABEL_HEIGHT),"魔法防御：","red");
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(SkillName)).Length;cnt++)
		{
			//GUI.Label(new Rect(200,110+((cnt+3)*25),100,25),((SkillName)cnt).ToString()+":","red");
			GUI.Label(new Rect(250+OFFSET_X,110+((cnt+3)*OFFSET_Y),LABEL_WIDTH,LABEL_HEIGHT),_toon.GetSkill(cnt).AdjustedBaseValue.ToString());
		}
	}
	
	private void DisplayPointsLeft()
	{
		GUI.Label(new Rect(OFFSET_X,65+(OFFSET_Y*9),LABEL_WIDTH,LABEL_HEIGHT),"剩余属性点:","green");
		GUI.TextArea(new Rect(70+OFFSET_X,65+(OFFSET_Y*9),LABEL_WIDTH,LABEL_HEIGHT),pointsLeft.ToString());
	}
	
	private void DisplayCreatLabel()
	{
		GUI.Label(new Rect(180-40,65+(OFFSET_Y*11),LABEL_WIDTH*2,LABEL_HEIGHT),"输入","Button");
	}
	
	private void DisplayCreatButton()
	{
		if(GUI.Button(new Rect(180-40,65+(OFFSET_Y*11),LABEL_WIDTH*2,LABEL_HEIGHT),"确定"))
		{
			GameSettings gsScript=GameObject.Find("__GameSettings").GetComponent<GameSettings>();
			//change the cur value of the vitals to the max modified value of vital
			UpdateCurVitalValues();
			
			//save the character data
			gsScript.SaveCharacterData();
			
			Application.LoadLevel(1);
		}
	}
	
	private void UpdateCurVitalValues()
	{
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(VitalName)).Length;cnt++)
		{
			_toon.GetVital(cnt).CurValue = _toon.GetVital(cnt).AdjustedBaseValue;
		}
	}
}
