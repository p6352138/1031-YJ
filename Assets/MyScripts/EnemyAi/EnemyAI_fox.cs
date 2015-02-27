using UnityEngine;
using System.Collections;

public class EnemyAI_fox : MonoBehaviour 
{
	private GameObject Target;
	public int Exp3 = 40;
	
	public GameObject Explosion;
	public GameObject Tiger_position;
	
	private float attackTimer2=1f;
	
	private float moveSpeed;
	private float distance;
	private int enemyState;

	private float backUptime;
	public const int AI_THINK_TIME = 2;
	public const int AI_ATTACK_DISTANCE = 10;
	
	public GUISkin mySkin;
	public int maxHealth=100;
	public int curHealth=100;
	public float EnemyHealthbar;
	
	private bool enemyDeath;
	
	void Start()
	{
		Exp3 = 400;
		EnemyHealthbar = 200;
		curHealth = maxHealth = 400;
	    Target=GameObject.FindGameObjectWithTag("Player");
		enemyState = 0;
	}

	void Update() 
	{
		if(Target==null)
			return;
		distance=Vector3.Distance(Target.transform.position,transform .position);	
		switch(enemyState)
		{
		case 0:
			moveSpeed =0; 
			animation.CrossFade("fox_idle");	
			break;
		case 1:
			moveSpeed = 0.3f;
			animation.CrossFade("fox_walk");
			gameObject.transform.Translate(Vector3.forward*Time.deltaTime*moveSpeed);	
			break;
		case 2:
			moveSpeed = 6;
			animation["fox_run"].layer = 2;
			animation.CrossFade("fox_run");
			gameObject.transform.Translate(Vector3.forward*Time.deltaTime*moveSpeed);	
			break;
		case 3:
			moveSpeed = 0;
			animation["fox_attack1"].layer = 3;
			animation.CrossFade("fox_attack1");
			break;
		case 4:
			moveSpeed = 0;
			animation["fox_attack2"].layer = 3;
			animation.CrossFade("fox_attack2");
			break;
		}
		
		updateHealth();
		
		if(!enemyDeath)
			AttackAI();
	}
	
	void OnGUI()
	{
		GUI.skin=mySkin;
		if(curHealth != 0)
		{
			if(curHealth < maxHealth)
			{
				Target.GetComponentInChildren<CharacterController>().Enemy = Tiger_position;
				EnemyHealthbar=(200)*(curHealth/(float)maxHealth);
				GUI.Label(new Rect(Screen.width/2 + 200,40,160,160),"红狐","yellow1");
				GUI.Label(new Rect(Screen.width/2 + 100,130,100,20),"Lv.4","yellow");
				GUI.Label(new Rect(Screen.width/2 + 10,10,160,160),"","狐狸");
				GUI.Box(new Rect(Screen.width/2 + 125,70,EnemyHealthbar,20),"","血条");
				GUI.Box(new Rect(Screen.width/2 + 195,70,100,20),curHealth + "/" + maxHealth,"white");
				GUI.Box(new Rect(Screen.width/2 + 125,90,200,20),"","蓝条");
				GUI.Box(new Rect(Screen.width/2 + 195,90,100,20),0 + "/" + 0,"white");
			}
		}
	}
	
	void  OnCollisionEnter(Collision theCollision )
	{
		if(theCollision.gameObject.tag == "Magic")
		{
			Instantiate(Explosion,Tiger_position.transform.position,Tiger_position.transform.rotation);
			if(curHealth > 0)
			{
				curHealth -=Target.GetComponentInChildren<CharacterController>().attack;
			}
		}
	}
	
	private void updateHealth()
	{
		if(curHealth == 0)
		{
			enemyDeath = true;
			Destroy (gameObject);
			Target.GetComponentInChildren<CharacterController>().curExp += Exp3;
			GameObject.Find("position_fox").GetComponentInChildren<EnemyPrefab_fox>().cunt3-=1;
			Target.GetComponentInChildren<CharacterController>().playerAttack = false;
			GameObject.Find("myGUI").GetComponentInChildren<myGUI>().money += 75;
			if(Target.GetComponentInChildren<CharacterController>().distask == 6)
			{
			    Target.GetComponentInChildren<CharacterController>().count += 1;
			}
		}
		if(curHealth<0){
			curHealth=0;
		}
		if(curHealth>maxHealth)
			curHealth=maxHealth;
		if(maxHealth<1)
			maxHealth=1;
		EnemyHealthbar=(200)*(curHealth/(float)maxHealth);
	}
	
	private void AttackAI()
	{
		int Ram;
		//判断敌人与主角的距离
		if(curHealth < maxHealth && distance <AI_ATTACK_DISTANCE && Target.GetComponentInChildren<CharacterController>().curHealth > 0)
		{
			transform.LookAt(Target.transform);
			transform.Rotate(Vector3.right, Time.deltaTime);
			if(distance > 3f)
			{
				enemyState = 2;
			}
			if(curHealth < maxHealth && distance <= 3f)
			{
				Ram = Random.Range(0,3);
				if(Ram ==0)
				{
					enemyState = 3;		
				}
				if(Ram == 2)
				{
					enemyState = 4;		
				}
				if(attackTimer2>0)
					attackTimer2-=Time.deltaTime;
		        if(attackTimer2<0)
					attackTimer2=0;
				if(attackTimer2==0)
				{
					if(Ram == 0)
					{
					    Target.GetComponentInChildren<CharacterController>().AdddjustcurHealth(-16);
					}
					
					if(Ram == 2)
					{
					    Target.GetComponentInChildren<CharacterController>().AdddjustcurHealth(-20);
					}
					attackTimer2 = 0.6f;
				}		
			}
			if(curHealth<=0)
			{
				enemyDeath = true;
			}
		}
		//敌人进入巡逻状态
		else
		{
			//计算敌人思考时间
			if(Time.time - backUptime >=AI_THINK_TIME)
			{
				backUptime = Time.time;
				int rand = Random.Range(0,2);
				if(rand == 0)
				{
					enemyState = 1;
				}
				else if(rand == 1)
				{  
					//敌人随机旋转角度
					Quaternion rotate = Quaternion.Euler(0,Random.Range(1,5) *90,0);
					transform.rotation = Quaternion.Slerp(transform.rotation,rotate, Time.deltaTime*1000);  
					enemyState =0;
				}
			}
		}	
	}
}
