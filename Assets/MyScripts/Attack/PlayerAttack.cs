using UnityEngine;
using System.Collections;

public class PlayerAttack : MonoBehaviour {
	public GameObject target;
	public float attackTimer=0;
	public float coolDown=1;
	
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		//Debug.Log("AttackTimer:"+attackTimer);
		if(attackTimer>0)
			attackTimer-=Time.deltaTime;
		
		if(attackTimer<0)
			attackTimer=0;
		
		if(Input.GetKeyUp(KeyCode.F))
		{
			if(attackTimer==0){
				if(target==null)
				{
					Debug.Log("请选择目标!");
					return;
				}
				else
				{
				    Attack();
				    attackTimer=coolDown;
				}
			}
		}
	}
	
	private void Attack(){
		float distance=Vector3.Distance(target.transform.position,transform .position);
		
		Vector3 dir=(target.transform.position - transform .position);
		
		float direction=Vector3.Dot(dir,transform.forward);

		if(distance<4){
			if(direction>0){
		        EnemyHealth eh=(EnemyHealth)target.GetComponent("EnemyHealth");
		        eh.AdddjustcurHealth(-30);
			}
		}
	}
}
