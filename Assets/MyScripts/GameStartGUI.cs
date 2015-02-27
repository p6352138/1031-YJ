using UnityEngine;
using System.Collections;

public class GameStartGUI : MonoBehaviour {
	public GUISkin mySkin;
	public AudioClip music1;
	public Texture2D Pic1;
	public Texture2D TransitPic1;
	public Texture2D TransitPic2;
	
	public const int STATE_MAINMENU = 0;
	public const int STATE_START = 1;
	public const int STATE_PIC = 2;
	public const int STATE_BACK = 3;
	
	private int gameState;
	
	private PlayerCharacter _toon;
	
	public GameObject PlayerPrafab;
	private GameObject Player;
	
	private float Timer=0;
	private bool timer = true;
	
	private float TransitLength;
	private float p;
	
	private int buttonWidth = 120;
	private int buttonHeight = 30;
	
	// Use this for initialization
	void Start () {
		gameState = STATE_MAINMENU;
			
		audio.PlayOneShot(music1);
		
		GameObject pc=Instantiate(PlayerPrafab,Vector3.zero,Quaternion.identity) as GameObject;
		
		pc.name="Player";
		
		_toon=pc.GetComponent<PlayerCharacter>();
			
	}
	
	// Update is called once per frame
	void Update () {
		_toon.StatUpdate();
		
		if(!timer)
		{
		    if(Timer<2)
			    Timer+=Time.deltaTime;
		    if(Timer>2)
			    Timer=2;
			if(Timer==2)
		    {
		        Application.LoadLevel(1);
		    }
			p=Timer/2;
			TransitLength=(Screen.width-160)*p;
		}
	}
	
	void OnGUI()
	{
		GUI.skin=mySkin;
		
		switch(gameState)
		{
		case STATE_MAINMENU: 
			RenderMainMenu();
			break;
			
		case STATE_START:
			RenderStart();
			break;
		case STATE_PIC:
			RenderPic();
			break;
		case STATE_BACK: 
			RenderBack();
			break;
		}
	}
	
	void RenderMainMenu()
	{
		GUI.skin=mySkin;
		if(GUI.Button(new Rect(Screen.width/2-buttonWidth/2,Screen.height/2 + 60,buttonWidth,buttonHeight)," ","按钮"))
		{
			gameState = STATE_BACK;
		}
		if(GUI.Button(new Rect(Screen.width/2-buttonWidth/2,Screen.height/2 + 100,buttonWidth,buttonHeight)," ","按钮"))
		{
			Application.Quit();
		}  
		GUI.Label(new Rect(Screen.width/2-buttonWidth/2 + 30,Screen.height/2 + 64,buttonWidth,buttonHeight)," 开      始","gold");
		GUI.Label(new Rect(Screen.width/2-buttonWidth/2 + 30,Screen.height/2 + 104,buttonWidth,buttonHeight)," 退      出","gold");
	}
	
	void RenderStart()
	{
		DisplayName();
		
		if(_toon.Name == "")
			DisplayCreatLabel();
		else
		    DisplayCreatButton();
		
		if(GUI.Button(new Rect(Screen.width/2-buttonWidth/2,Screen.height/2+120,buttonWidth,buttonHeight)," ","按钮"))
		{
			gameState = STATE_MAINMENU;
		}
		GUI.Label(new Rect(Screen.width/2-buttonWidth/2 + 30,Screen.height/2 + 124,buttonWidth,buttonHeight)," 返      回","gold");
	}
	
	void RenderPic()
	{
		GUI.DrawTexture(new Rect(0,0,Screen.width,Screen.height),TransitPic2);
		GUI.DrawTexture(new Rect(80,0,TransitLength,Screen.height),TransitPic1);	
		GUI.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Pic1);	
		GUI.Label(new Rect(Screen.width/2-50,Screen.height-130,100,30),"正在载入场景....","green");
		GUI.Label(new Rect(Screen.width/2+50,Screen.height-130,100,30),Mathf.CeilToInt(p*100)+"%","red");
	}
	
	void RenderBack()
	{
		GUI.Label(new Rect(Screen.width/2 - 300,Screen.height/2 - 200,600,400),"","说明框");
		GUI.Label(new Rect(Screen.width/2 - 280,Screen.height/2 - 160,600,400),"        仙剑奇侠传四中的第二男主角，昆仑琼华派弟子慕容紫英，很早被家人送","yellow");
		GUI.Label(new Rect(Screen.width/2 - 280,Screen.height/2 - 140,600,400),"至昆仑山修行，天赋极高，在同辈弟子中修为较深。在一次斩妖除魔的过程中，","yellow");
		GUI.Label(new Rect(Screen.width/2 - 280,Screen.height/2 - 120,600,400),"因打斗激烈，产生空间裂缝，不慎卷入空间通道中穿越到了异世大陆，开始了主","yellow");
		GUI.Label(new Rect(Screen.width/2 - 280,Screen.height/2 - 100,600,400),"角的异界之旅。不过，由于未知原因，主角在穿越过程中失去记忆，请重新取名","yellow");
		GUI.Label(new Rect(Screen.width/2 - 280,Screen.height/2 - 80,600,400),"开始你的异界之旅吧。","yellow");
		if(GUI.Button(new Rect(Screen.width/2-buttonWidth/2,Screen.height/2+120,buttonWidth,buttonHeight)," ","按钮1"))
		{
			gameState = STATE_START;
		}
		GUI.Label(new Rect(Screen.width/2-buttonWidth/2 + 30,Screen.height/2 + 124,buttonWidth,buttonHeight)," 跳      过","gold");
	}
	private void DisplayName()
	{
		GUI.Label(new Rect(Screen.width/2-60,Screen.height/2+36,120,34)," ","按钮");
		_toon.Name=GUI.TextArea(new Rect(Screen.width/2-56,Screen.height/2+40,112,24),_toon.Name);
	
	}
	
	private void DisplayCreatLabel()
	{
		GUI.Button(new Rect(Screen.width/2-buttonWidth/2,Screen.height/2+80,buttonWidth,buttonHeight)," ","按钮");
		GUI.Label(new Rect(Screen.width/2-buttonWidth/2 + 30,Screen.height/2 + 84,buttonWidth,buttonHeight),"创建角色","gold");
	}
	
	private void DisplayCreatButton()
	{
		if(GUI.Button(new Rect(Screen.width/2-buttonWidth/2,Screen.height/2+80,buttonWidth,buttonHeight)," ","按钮"))
		{
			timer = false;
			
			gameState = STATE_PIC;
			GameSettings gsScript=GameObject.Find("__GameSettings").GetComponent<GameSettings>();
			UpdateCurVitalValues();
			gsScript.SaveCharacterData();
			
		}
		GUI.Label(new Rect(Screen.width/2-buttonWidth/2 + 30,Screen.height/2 + 84,buttonWidth,buttonHeight),"创建角色","gold");
	}
	
	private void UpdateCurVitalValues()
	{
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(VitalName)).Length;cnt++)
		{
			_toon.GetVital(cnt).CurValue = _toon.GetVital(cnt).AdjustedBaseValue;
		}
	}
	
}
