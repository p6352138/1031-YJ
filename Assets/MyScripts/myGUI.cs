using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class myGUI : MonoBehaviour 
{
	public GUISkin mySkin;
	
	public Transform target;
	
	public int money;
	
	public float lootWindowHeight = 90;
	
	private float buttonWidth = 36;
	private float buttonHeight = 36 ;
	private float closeButtonWidth = 14;
	private float closeButtonHeight = 14;
	private int _Rows = 8;
	private int _Cols = 6;
	private int shop;
	private int shopState;
	public List<Item> loot = new List<Item>();
	private string[] positionNames = new string[] {"武器","衣服","护腕","腰带","项链","裤子","戒指","鞋子"};
	
	
	/***********************************************/
	/*                      商店                   */
	/***********************************************/
    public bool _displayShopWindow = false;
	private const int SHOP_WINDOW_ID = 0;
	private Rect _shopWindowRect = new Rect(Screen.width/2-275,Screen.height/2-210,270,420);
	
	private string _toolTip = "";
	
	
	/***********************************************/
	/*                     背包                    */
	/***********************************************/
	public bool _displayInventoryWindow = false;
	private const int INVENTORY_WINDOW_ID = 1;
	private Rect _inventoryWindowRect = new Rect(Screen.width/2+5,Screen.height/2-210,270,420);
	
	private float _doubleClickTimer = 0;
	private const float DOUBLE_CLICK_TIMER_THRESHHOLD = 1f;
	private Item _selectedItem;
	
	/***********************************************/
	/*                 人物属性                     */
	/***********************************************/
	public bool _displayCharacterWindow = false;
	private const int CHARACTER_WINDOW_ID = 2;
	private Rect _characterWindowRect = new Rect(Screen.width/2-365,Screen.height/2-210,360,420);
	private int _characterPanel = 0;
	private string[] _characterPanelNames = new string[] {"","",""};
	
	/***********************************************/
	/*                 说明框                     */
	/***********************************************/
	public bool _displayIntroduecWindow = false;
	private const int INTRODUCE_WINDOW_ID = 3;
	private Rect _IntroduceWindowRect = new Rect(Screen.width/2-120,Screen.height/2,240,260);
	
	/*******************人物属性面板***************/
	public GameObject Player;

	//private  float closeButtonwidth = 20;
	//private  float closeButtonheight = 20;
	
	public PlayerCharacter _toon;
	private const int STARTING_POINTS=5;
	private const int MIN_STARTING_ATTRIBUTE_VALUE=25;
	private const int STARTING_VALUE=25;
	public int pointsLeft;
	
	private const int OFFSET_X=30;
	private const int OFFSET_Y=25;
	private const int BUTTON_WIDTH=20;
	private const int BUTTON_HEIGHT=20;
	private const int LABEL_WIDTH=40;
	private const int LABEL_HEIGHT=20;
	
	
	// Use this for initialization
	void Start () 
	{
		target = GameObject.FindGameObjectWithTag("Player").transform;
		money = 0;
		shopState = 0;
		
		GameObject pc=Instantiate(Player,Vector3.zero,Quaternion.identity) as GameObject;
		
		pc.name="Player";
		
		_toon=pc.GetComponent<PlayerCharacter>();
			
		pointsLeft=STARTING_POINTS;
			
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
		{
			_toon.GetPrimaryAttribute(cnt).BaseValue=STARTING_VALUE;
		}
	}
	
	// Update is called once per frame
	void Update () 
	{
		if(target.GetComponentInChildren<CharacterController>().curExp >= target.GetComponentInChildren<CharacterController>().maxExp)
		{
			for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
			{
				_toon.GetPrimaryAttribute(cnt).BaseValue +=5;
			}
		}
		target.GetComponentInChildren<CharacterController>().maxHealth = _toon.GetPrimaryAttribute(1).BaseValue * 10;
		target.GetComponentInChildren<CharacterController>().maxMana = _toon.GetPrimaryAttribute(3).BaseValue * 10;
		target.GetComponentInChildren<CharacterController>().attack = _toon.GetPrimaryAttribute(0).BaseValue;
		target.GetComponentInChildren<CharacterController>().defence = _toon.GetPrimaryAttribute(3).BaseValue;

		if(Input.GetButtonUp("Toggle Inventory"))
		{
			ToggleInventoryWindow();
		}
		
		if(Input.GetButtonUp("Toggle Character"))
		{
			ToggleCharacterWindow();
		}
		
		_toon.StatUpdate();
		//Debug.Log("money:"+money);
		//Debug.Log("attack:"+target.GetComponentInChildren<CharacterController>().attack);
	}
	
	void OnGUI() 
	{
		GUI.skin = mySkin; 
		if(_displayCharacterWindow)
			_characterWindowRect = GUI.Window(CHARACTER_WINDOW_ID,_characterWindowRect,CharacterWindow ,"","外框");
		
		if(_displayInventoryWindow)
			_inventoryWindowRect = GUI.Window(INVENTORY_WINDOW_ID,_inventoryWindowRect,InventoryWindow ,"","外框");
	    
		if(_displayShopWindow)
			_shopWindowRect = GUI.Window(SHOP_WINDOW_ID,_shopWindowRect,ShopWindow,"","外框");
		
		if(_displayIntroduecWindow)
			_IntroduceWindowRect = GUI.Window(INTRODUCE_WINDOW_ID,_IntroduceWindowRect,IntroduceWindow,"","说明框");
		
	     DisplayToolTip();
	}
	
	private void ShopWindow(int id)
	{
		GUI.Label(new Rect(135-70,370,200,25),"提示：双击物品进行购买" + "\n" +
				                                        "        双击背包物品卖出装备","green");
		if(GUI.Button(new Rect(_shopWindowRect.width - 22, 6, closeButtonWidth,closeButtonHeight),"","closeButton"))
		{
			ClearWindow();
			shopState = 0;
		}
		switch(shopState)
		{
		case 0:
			DisplayShop(shop);
			DisplayDialogue(shop);
			RenderShop();
			break;
		case 1:
			DisplayShop(shop);
			RenderShopBuyList();
			break;
		}
		SetToolTip();
		GUI.DragWindow();
	}
	
	public void InventoryWindow(int id)
	{
		GUI.Label(new Rect(135-16,2,100,25),"背包","white");
		GUI.Label(new Rect(12,34,248,330),"","内框2");
		GUI.Label(new Rect(62,372,120,22),"金币：","gold");
		GUI.Label(new Rect(135-40,370,120,22),"","金币框");
		GUI.Label(new Rect(100,372,120,22),"" + money,"gold");
		if(GUI.Button(new Rect(_inventoryWindowRect.width - 22, 6, closeButtonWidth,closeButtonHeight),"","closeButton"))
		{
			_displayInventoryWindow = false;
		}
		int cnt = 0;
		for(int y = 0; y < _Rows; y++)
		{
			for(int x = 0; x < _Cols; x++)
			{
				if(cnt < PlayerCharacter.Inventory.Count)
				{
				    if(GUI.Button(new Rect(17 + (x * (buttonWidth+4)),40 + (y * (buttonHeight+4)),buttonWidth,buttonHeight),new GUIContent(PlayerCharacter.Inventory[cnt].Icon,PlayerCharacter.Inventory[cnt].ToolTip()),"Slot"))
					{
						_displayIntroduecWindow = false;
						if(_doubleClickTimer !=0 && _selectedItem != null)
						{
							if(Time.time - _doubleClickTimer < DOUBLE_CLICK_TIMER_THRESHHOLD)
							{
								if(PlayerCharacter.EquipedWeapon == null)
								{
								    PlayerCharacter.EquipedWeapon = PlayerCharacter.Inventory[cnt];
									PlayerCharacter.Equipment.Add(PlayerCharacter.EquipedWeapon);
								    PlayerCharacter.Inventory.RemoveAt(cnt);
									if(PlayerCharacter.EquipedWeapon.Name == "藏锋剑")
									{
									     _toon.GetPrimaryAttribute(0).BaseValue += 80;
										 _toon.GetPrimaryAttribute(1).BaseValue += 50;
										 target.GetComponentInChildren<CharacterController>().curHealth = target.GetComponentInChildren<CharacterController>().curHealth;
									}
								}
								else
								{
									Item temp = PlayerCharacter.EquipedWeapon;
									PlayerCharacter.EquipedWeapon = PlayerCharacter.Inventory[cnt];
								    PlayerCharacter.Inventory[cnt] = temp;
								}
								
								_doubleClickTimer = 0;
								_selectedItem = null;
							}
							else
							{
								_doubleClickTimer = Time.time;
							}
						}
						else
						{
							_doubleClickTimer = Time.time;
							_selectedItem = PlayerCharacter.Inventory[cnt];
						}
					}		
			    }
			    else
			    {
				    GUI.Label(new Rect(17 + (x * (buttonWidth+4)),40 + (y * (buttonHeight+4)),buttonWidth,buttonHeight),"","Slot");
			    }
				cnt++;
			}
		}
		SetToolTip();
		GUI.DragWindow();
	}
		
	public void CharacterWindow(int id)
	{
		GUI.Label(new Rect(150-32,2,100,25),"人物属性","white");
		if(GUI.Button(new Rect(_characterWindowRect.width - 27, 6, closeButtonWidth,closeButtonHeight),"","closeButton"))
		{
			_displayCharacterWindow = false;
		}
		_characterPanel = GUI.Toolbar(new Rect(50,30,_characterWindowRect.width -100,25),_characterPanel,_characterPanelNames,"按钮2");
		GUI.Label(new Rect(80,36,100,25),"装备","gray");
		GUI.Label(new Rect(168,36,100,25),"属性","gray");
		GUI.Label(new Rect(256,36,100,25),"技能","gray");
		switch(_characterPanel)
		{
		case 0:
			DisplayEquipment();
		    break;
		case 1:
			DisplayAttributes();
		    break;
		case 2:
			DisplaySkills();
		    break;
		}
		GUI.DragWindow();
	}
	
	private void IntroduceWindow(int id)
	{
		if(_displayInventoryWindow)
		{
		    GUI.Label(new Rect(17,10,200,100),_toolTip,"blue");
		    GUI.Label(new Rect(30,50,200,100),"类型：装备类","gray");
		    GUI.Label(new Rect(30,70,200,100),"等级：Lv.1","gray");
		    GUI.Label(new Rect(30,90,200,100),"职业：逍遥","gray");
		    GUI.Label(new Rect(30,110,200,100),"部位：武器","gray");
		    GUI.Label(new Rect(15,130,210,6),"","直线2");
		    GUI.Label(new Rect(17,140,200,100),"基础属性","orange");
		    GUI.Label(new Rect(30,160,200,100),"力量 +80","green");
			GUI.Label(new Rect(30,180,200,100),"体质 +50","green");
		    GUI.Label(new Rect(15,200,210,6),"","直线2");
		    GUI.Label(new Rect(50,210,200,100),"价值：100金币","gray");
		}
		GUI.DragWindow();
	}
	
	private void DisplayEquipment()
	{
		GUI.Label(new Rect(12,50,340,360),"","内框2");
		GUI.Label(new Rect(44,140,160,180),"","人物");
		DisplayName();
		
		GUI.Label(new Rect(60,110,400,20),"等级：","gray");
		GUI.Label(new Rect(100,110,400,20),"" + target.GetComponentInChildren<CharacterController>().Level,"gray");
		GUI.Label(new Rect(80,110,400,20),"             职业：逍遥","gray");
		GUI.Label(new Rect(44,350,160,180),"气血:","gray");
		GUI.Label(new Rect(80,350,100,14),"","血条");
		GUI.Label(new Rect(80,350,100,14),"","条框");
		GUI.Label(new Rect(44,370,160,180),"内力:","gray");
		GUI.Label(new Rect(80,370,100,14),"","蓝条");
		GUI.Label(new Rect(80,370,100,14),"","条框");
		
		GUI.Label(new Rect(240,90,100,280),"","内框1");
		GUI.Label(new Rect(250,120,80,20),"","直线");
		GUI.Label(new Rect(250,150,100,20),"攻击：","green");
		GUI.Label(new Rect(250,170,100,20),"防御：","green");
		GUI.Label(new Rect(250,200,80,20),"","直线");
		GUI.Label(new Rect(250,240,100,20),"力量：","green");
		GUI.Label(new Rect(250,260,100,20),"体质：","green");
		GUI.Label(new Rect(250,280,100,20),"智力：","green");
		GUI.Label(new Rect(250,300,100,20),"敏捷：","green");
		
		for(int ct1=0;ct1<System.Enum.GetValues(typeof(AttributeName)).Length;ct1++)
		{
			GUI.Label(new Rect(285,240+(ct1*20),LABEL_WIDTH,LABEL_HEIGHT),_toon.GetPrimaryAttribute(ct1).AdjustedBaseValue.ToString(),"green");
		}
		
		GUI.Label(new Rect(285,110+(2*20),LABEL_WIDTH,LABEL_HEIGHT),"" + target.GetComponentInChildren<CharacterController>().attack,"green");
		GUI.Label(new Rect(285,110+(3*20),LABEL_WIDTH,LABEL_HEIGHT),"" + target.GetComponentInChildren<CharacterController>().defence,"green");
		
		GUI.Label(new Rect(250,330,80,20),"","直线");
		int cunt = 0;
		for(int i = 0; i <2; i++)
		{
			for(int j = 0; j<4; j++)
			{
				{
					GUI.Label(new Rect(20 + (i * (buttonWidth+140)),164 + (j * (buttonHeight+10)),buttonWidth,buttonHeight),"","Slot");
					GUI.Label(new Rect(26 + (i * (buttonWidth+140)),174 + (j * (buttonHeight+10)),buttonWidth,buttonHeight),positionNames[cunt],"gray");
					cunt ++;
		        }
			}
		}
		//int cnt = 0;
		//for(int i = 0; i <2; i++)
		//{
			//for(int j = 0; j<4; j++)
			//{
				//if(GUI.Button(new Rect(20 + (0 * (buttonWidth+140)),164 + (0 * (buttonHeight+10)),buttonWidth,buttonHeight),new GUIContent(PlayerCharacter.EquipedWeapon.Icon,PlayerCharacter.EquipedWeapon.ToolTip()),"Slot"))
			   // {
				   // PlayerCharacter.Inventory.Add(PlayerCharacter.EquipedWeapon);
				   // PlayerCharacter.EquipedWeapon = null;
			   // }
			//}
		//}
		if(GUI.Button(new Rect(20 + (0 * (buttonWidth+140)),164 + (0 * (buttonHeight+10)),buttonWidth,buttonHeight),new GUIContent(PlayerCharacter.EquipedWeapon.Icon,PlayerCharacter.EquipedWeapon.ToolTip()),"Slot"))
		{
			_toon.GetPrimaryAttribute(0).BaseValue -= 80;
			_toon.GetPrimaryAttribute(1).BaseValue -= 50;
			PlayerCharacter.Inventory.Add(PlayerCharacter.EquipedWeapon);
			PlayerCharacter.EquipedWeapon = null;
		}
		
		SetToolTip();
	}
	
	private void DisplayAttributes()
	{
		GUI.Label(new Rect(12,50,340,360),"","内框2");
		DisplayName();
		GUI.Label(new Rect(30,100,400,20),"等级：","yellow");
		GUI.Label(new Rect(80,100,400,20),"" + target.GetComponentInChildren<CharacterController>().Level,"yellow");
		GUI.Label(new Rect(30,130,400,20),"职业：逍遥","yellow");
		DisAttributes();
		DisplayVitals();
		DisplayCreatButton();
	}
	
	private void UpdateCurVitalValues()
	{
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(VitalName)).Length;cnt++)
		{
			_toon.GetVital(cnt).CurValue = _toon.GetVital(cnt).AdjustedBaseValue;
		}
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
			_displayCharacterWindow = !_displayCharacterWindow;
		}
	}
	
	private void DisplaySkills()
	{
		GUI.Label(new Rect(12,50,340,360),"","内框2");
	}
	
	private void DisplayName()
	{
		GameObject pc=GameObject.Find("Player");
		PlayerCharacter pcClass=pc.GetComponent<PlayerCharacter>();
		pcClass.Name = PlayerPrefs.GetString("Player Name","Name Me");
		GUI.Label(new Rect(110,70,100,20),""+pcClass.Name,"yellow");
	}
	
	private void DisAttributes()
	{
		//"在属性窗口显示角色属性"
		GUI.Label(new Rect(OFFSET_X,135+(OFFSET_Y*1),LABEL_WIDTH,LABEL_HEIGHT),"力量：","yellow");
		GUI.Label(new Rect(OFFSET_X,135+(OFFSET_Y*2),LABEL_WIDTH,LABEL_HEIGHT),"体质：","yellow");
		GUI.Label(new Rect(OFFSET_X,135+(OFFSET_Y*3),LABEL_WIDTH,LABEL_HEIGHT),"智力：","yellow");
		GUI.Label(new Rect(OFFSET_X,135+(OFFSET_Y*4),LABEL_WIDTH,LABEL_HEIGHT),"敏捷：","yellow");
		GUI.Label(new Rect(OFFSET_X,135+(OFFSET_Y*5),LABEL_WIDTH,LABEL_HEIGHT),"剩余属性点：","yellow");
		GUI.TextArea(new Rect(OFFSET_X+100,135+(OFFSET_Y*5),LABEL_WIDTH,LABEL_HEIGHT),"");
		GUI.TextArea(new Rect(OFFSET_X+100,135+(OFFSET_Y*5),LABEL_WIDTH,LABEL_HEIGHT),pointsLeft.ToString(),"yellow");
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
		{
			//GUI.Label(new Rect(20,110+(cnt*25),100,25),((AttributeName)cnt).ToString()+":","green");
			GUI.TextArea(new Rect(OFFSET_X+45,160+(cnt*OFFSET_Y),LABEL_WIDTH,LABEL_HEIGHT),"");
			GUI.Label(new Rect(OFFSET_X+45,160+(cnt*OFFSET_Y),LABEL_WIDTH,LABEL_HEIGHT),_toon.GetPrimaryAttribute(cnt).AdjustedBaseValue.ToString(),"yellow");
			if(GUI.Button(new Rect(OFFSET_X+100,160+(cnt*OFFSET_Y),BUTTON_WIDTH,BUTTON_HEIGHT),"-"))
			{
				if(pointsLeft>=0)
				{
					if(_toon.GetPrimaryAttribute(cnt).BaseValue>MIN_STARTING_ATTRIBUTE_VALUE)
					{
					    _toon.GetPrimaryAttribute(cnt).BaseValue--;
					    pointsLeft++;
						_toon.StatUpdate();
					}
				}
			}
			if(GUI.Button(new Rect(OFFSET_X+125,160+(cnt*OFFSET_Y),BUTTON_WIDTH,BUTTON_HEIGHT),"+"))
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
		GUI.Label(new Rect(180+OFFSET_X,135+(OFFSET_Y*1),LABEL_WIDTH,LABEL_HEIGHT),"气血：","orange");
		GUI.Label(new Rect(180+OFFSET_X,135+(OFFSET_Y*2),LABEL_WIDTH,LABEL_HEIGHT),"法力：","orange");
		GUI.Label(new Rect(180+OFFSET_X,135+(OFFSET_Y*3),LABEL_WIDTH,LABEL_HEIGHT),"攻击：","orange");
		GUI.Label(new Rect(180+OFFSET_X,135+(OFFSET_Y*4),LABEL_WIDTH,LABEL_HEIGHT),"防御：","orange");
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(VitalName)).Length;cnt++)
		{
			GUI.Label(new Rect(250,160+(cnt*OFFSET_Y),LABEL_WIDTH,LABEL_HEIGHT),_toon.GetVital(cnt).AdjustedBaseValue.ToString());
		}
	}
	
	private void DisplayLoot()
	{
		_displayShopWindow = true;
	}
	
	private void DisplayShop(int i)
	{
		shop=i;
		switch(shop)
		{
		case 1:
			GUI.Label(new Rect(12,34,248,330),"","内框2");
			GUI.Label(new Rect(135-24,2,100,25),"武器店","white");
			break;
		case 2:
			GUI.Label(new Rect(12,34,248,330),"","内框2");
			GUI.Label(new Rect(135-24,2,100,25),"防具店","white");
			break;
		case 3:
			GUI.Label(new Rect(12,34,248,330),"","内框2");
			GUI.Label(new Rect(135-24,2,100,25),"药品店","white");
			break;
		case 4:
			GUI.Label(new Rect(12,34,248,330),"","内框2");
			GUI.Label(new Rect(135-24,2,100,25),"首饰店","white");
			break;
		}
	}
	
	private void DisplayDialogue(int i)
	{
		shop=i;
		switch(shop)
		{
		case 1:
			GUI.Label(new Rect(30,60,100,25),"铁匠：" + "\n" +
				                                "人在江湖，至少得拿件武器自卫一下！","gray");
			break;
		case 2:
			GUI.Label(new Rect(30,60,100,25),"裁缝：" + "\n" +
				                                "穿上防具，能提升你的人物属性！","gray");
			break;
		case 3:
			GUI.Label(new Rect(30,60,100,25),"药师：" + "\n" +
				                                "外出历练，难免会有点小伤！","gray");
			break;
		case 4:
			GUI.Label(new Rect(30,60,100,25),"首饰商：" + "\n" +
				                                "我这里有很多精美的首饰，来看看吧！","gray");
			break;
		}
	}
	
	private void RenderShop()
	{
		
		if(GUI.Button(new Rect(40, 190, 60,20),"","按钮1"))
		{
			shopState = 1;
		}
		if(GUI.Button(new Rect(40, 230, 60,20),"","按钮1"))
		{
			shopState = 1;
		}
		GUI.Label(new Rect(58, 190, 60,20),"购买","gold");
		GUI.Label(new Rect(58, 230, 60,20),"卖出","gold");
	}
	
	private void RenderShopBuyList()
	{
		int cnt = 0;
		for(int y = 0; y < _Rows; y++)
		{
			for(int x = 0; x < _Cols; x++)
			{
				if(cnt < loot.Count)
				{
				    if(GUI.Button(new Rect(17 + (x * (buttonWidth+4)),40 + (y * (buttonHeight+4)),buttonWidth,buttonHeight),new GUIContent(loot[cnt].Icon,loot[cnt].ToolTip()),"Slot"))
					{
						if(money >= 100)
						{
						_displayIntroduecWindow = false;
						if(_doubleClickTimer !=0)
						{
							if(Time.time - _doubleClickTimer < DOUBLE_CLICK_TIMER_THRESHHOLD)
							{
								if(loot[cnt].Name == "藏锋剑")
								{
									money -= 100;
								}
								PlayerCharacter.Inventory.Add(loot[cnt]);
								_doubleClickTimer = 0;
								_selectedItem = null;
							}
						}
						else
						{
							_doubleClickTimer = Time.time;
						}
						}
					}
				}
				else
			    {
				    GUI.Label(new Rect(17 + (x * (buttonWidth+4)),40 + (y * (buttonHeight+4)),buttonWidth,buttonHeight),"","Slot");
			    }
				cnt++;
			}
		}
	}
	
	private void PropList(int x)
	{
		switch(x)
		{
		case 1:
			if(!_displayShopWindow)
			{
				for(int cnt = 1;cnt < 2;cnt++)
				{
					loot.Add(ItemGenerator.CreateItem(cnt));
				}
			}
			break;
		case 2:
			if(!_displayShopWindow)
			{
				for(int cnt = 3;cnt < 13;cnt++)
				{
					loot.Add(ItemGenerator.CreateItem(cnt));
				}
			}
			break;
		case 3:
			if(!_displayShopWindow)
			{
				for(int cnt = 13;cnt < 17;cnt++)
				{
					loot.Add(ItemGenerator.CreateItem(cnt));
				}
			}
			break;
		case 4:
			if(!_displayShopWindow)
			{
				for(int cnt = 17;cnt < 19;cnt++)
				{
					loot.Add(ItemGenerator.CreateItem(cnt));
				}
			}
			break;
		}
		_displayShopWindow = true;
		_displayInventoryWindow = true;
	}
	
	private void ClearWindow()
	{
		loot.Clear();
		_displayShopWindow = false;
	}
	
	public void ToggleInventoryWindow()
	{
		_displayInventoryWindow = !_displayInventoryWindow;
	}
	
	public void ToggleCharacterWindow()
	{
		_displayCharacterWindow = !_displayCharacterWindow;
	}
		
	private void SetToolTip()
	{
		if(Event.current.type == EventType.Repaint && GUI.tooltip != _toolTip)
		{
			if(_toolTip != "")
				_toolTip = "";
			
			if(GUI.tooltip != "")
				_toolTip = GUI.tooltip;
		}
	}
	
	private void DisplayToolTip()
	{
		if(_toolTip != "")
		{
			_displayIntroduecWindow = true;
		}
		else
		{
			_displayIntroduecWindow = false;
		}
	}

	
}
