using UnityEngine;
using System.Collections;

public class EnemyAttack : MonoBehaviour 
{
	public GameObject target;
	public  float attackTimer=0;
	public  float coolDown=2;

	// Use this for initialization
	void Start () 
	{
		
	}
	
	// Update is called once per frame
	void Update () {
		if(attackTimer>0)
			attackTimer-=Time.deltaTime;
		
		if(attackTimer<0)
			attackTimer=0;
		if(target==null)
		{
					return;
		}
		else if(attackTimer==0)
		{
		    if(attackTimer==0)
			{
				Attack();
				attackTimer=coolDown;

			}
		}
		
	}
	
	private void Attack(){
		float distance=Vector3.Distance(target.transform.position,transform .position);
		
		Vector3 dir=(target.transform.position - transform .position);
		
		float direction=Vector3.Dot(dir,transform.forward);

		if(distance<3){
			if(direction>0){
		        PlayerHealth eh=(PlayerHealth)target.GetComponent("PlayerHealth");
		        eh.AdddjustcurHealth(-10);
			}
		}
	}

}
