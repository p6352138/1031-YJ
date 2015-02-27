using UnityEngine;
using System.Collections;

public class EnemyHealth : MonoBehaviour {
	public GUISkin myGUI;
	public int maxHealth=100;
	public int curHealth=100;
	
	public float healthBarLength;
	
	// Use this for initialization
	void Start () {
		healthBarLength=200;
	
	}
	
	// Update is called once per frame
	void Update () {
		AdddjustcurHealth(0);
	
	}
	
	void OnGUI(){
		GUI.skin=myGUI;
		GUI.Box(new Rect(Screen.width/2+50,10,healthBarLength,20),"","blood");
		GUI.Label(new Rect(Screen.width/2,12,50,25),"敌人:","blue");	
		GUI.Label(new Rect(Screen.width/2+120,12,100,25),curHealth+"/"+maxHealth,"blue");	
	}
	
	public void AdddjustcurHealth(int adj){
	    curHealth+=adj;
		if(curHealth<0){
			curHealth=0;
			Destroy(gameObject);
		}
		if(curHealth>maxHealth)
			curHealth=maxHealth;
		if(maxHealth<1)
			maxHealth=1;
		healthBarLength=(200)*(curHealth/(float)maxHealth);
	}
}
