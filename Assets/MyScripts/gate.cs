using UnityEngine;
using System.Collections;

public class gate : MonoBehaviour {
	
	public GUISkin mySkin;
	public int gat;
	public Transform position_gate;
	public GameObject player;
	private float p;
	private float Timer=0;
	private bool timer = true;
	private bool tim = true;
	private float TransitLength;
	
	public Texture2D Pic1;
	public Texture2D TransitPic1;
	public Texture2D TransitPic2;
	// Use this for initialization
	void Start () {
		gat = 0;
	}
	
	// Update is called once per frame
	void Update () {
		if(!timer)
		{
		    if(Timer<2)
			    Timer+=Time.deltaTime;
		    if(Timer>2)
			    Timer=2;
			if(Timer==2)
		    {
				Timer = 0;
		        gat = 0;
		    }
			p=Timer/2;
			TransitLength=(Screen.width-160)*p;
		}
		if(!tim)
		{
		    if(Timer<2)
			    Timer+=Time.deltaTime;
		    if(Timer>2)
			    Timer=2;
			if(Timer==2)
		    {
				Timer = 0;
		        Application.LoadLevel(0);
		    }
			p=Timer/2;
			TransitLength=(Screen.width-160)*p;
		}
	}
	void OnGUI()
	{
		GUI.skin = mySkin; 
		switch(gat)
		{
		case 1:
			DisGate();
			break;
		case 2:
			timer = false;
			GUI.DrawTexture(new Rect(0,0,Screen.width,Screen.height),TransitPic2);
		    GUI.DrawTexture(new Rect(80,0,TransitLength,Screen.height),TransitPic1);	
		    GUI.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Pic1);	
		    GUI.Label(new Rect(Screen.width/2-50,Screen.height-130,100,30),"正在载入场景....","green");
		    GUI.Label(new Rect(Screen.width/2+50,Screen.height-130,100,30),Mathf.CeilToInt(p*100)+"%","red");
			break;
		case 3:
			tim = false;
			GUI.DrawTexture(new Rect(0,0,Screen.width,Screen.height),TransitPic2);
		    GUI.DrawTexture(new Rect(80,0,TransitLength,Screen.height),TransitPic1);	
		    GUI.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Pic1);	
		    GUI.Label(new Rect(Screen.width/2-50,Screen.height-130,100,30),"正在载入场景....","green");
		    GUI.Label(new Rect(Screen.width/2+50,Screen.height-130,100,30),Mathf.CeilToInt(p*100)+"%","red");
			break;
		}
	}
	
	void OnMouseDown()
	{
		gat = 1;
	}
	
	void DisGate()
	{
		GUI.Label(new Rect(Screen.width/2 -100,Screen.height/2 - 85,200,170),"","说明框");
		if(GUI.Button(new Rect(Screen.width/2 -50,Screen.height/2 - 45,100,30),"","按钮1"))
		{
			player.GetComponentInChildren<CharacterController>().gat = true;
			gat = 2;
		}
		if(GUI.Button(new Rect(Screen.width/2 -50,Screen.height/2 - 10,100,30),"","按钮1"))
		{
			if(player.GetComponentInChildren<CharacterController>().Level >= 10)
			{
				gat = 3;
			}
		}
		if(GUI.Button(new Rect(Screen.width/2 -50,Screen.height/2 + 25,100,30),"","按钮1"))
		{
			gat = 0;
		}
		GUI.Label(new Rect(Screen.width/2 -20,Screen.height/2 - 70,100,30),"传送门","gray");
		GUI.Label(new Rect(Screen.width/2 -25,Screen.height/2 - 40,120,30),"落日草原","gold");
		GUI.Label(new Rect(Screen.width/2 -25,Screen.height/2 - 5,120,30),"前往城镇","gold");
		GUI.Label(new Rect(Screen.width/2 -25,Screen.height/2 + 30,120,30),"取      消","gold");
	}
}
