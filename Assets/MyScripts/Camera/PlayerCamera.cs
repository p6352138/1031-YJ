using UnityEngine; 
using System.Collections; 

public class PlayerCamera : MonoBehaviour 
{ 
    public Transform target; 
    public  float attackTimer;

    public float targetHeight = 1.7f; 
    public float distance = 5.0f;
    public float offsetFromWall = 0.1f;

    public float maxDistance = 20; 
    public float minDistance = .6f; 

    public float xSpeed = 200.0f; 
    public float ySpeed = 200.0f; 

    public int yMinLimit = -80; 
    public int yMaxLimit = 80; 

    public int zoomRate = 40; 

    public float rotationDampening = 3.0f; 
    public float zoomDampening = 5.0f; 
    
    public LayerMask collisionLayers = -1;

    private float xDeg = -53.2f; 
    private float yDeg = 22.4f; 
    private float currentDistance; 
    private float desiredDistance; 
    private float correctedDistance;

    void Start () 
    {
		attackTimer=0.05f;
        currentDistance = distance; 
        desiredDistance = distance; 
        correctedDistance = distance; 


        if (rigidbody) 
            rigidbody.freezeRotation = true; 
    } 
 
    void LateUpdate () 
    {
	    if(attackTimer>0)
			attackTimer-=Time.deltaTime;
		
		if(attackTimer<0)
			attackTimer=0;
		if(attackTimer==0){
		    target = GameObject.FindGameObjectWithTag("Player").transform;
		}
    	Vector3 vTargetOffset;
    	
  
        if (!target){ 
            return; 
		}
	
        if (Input.GetMouseButton(1) ) 
        { 
            xDeg += Input.GetAxis ("Mouse X") * xSpeed * 0.02f; 
            yDeg -= Input.GetAxis ("Mouse Y") * ySpeed * 0.02f; 
        } 
        
        yDeg = ClampAngle (yDeg, yMinLimit, yMaxLimit); 
        xDeg = ClampAngle (xDeg, -360, 360); 
		
        Quaternion rotation = Quaternion.Euler (yDeg, xDeg, 0); 


        desiredDistance -= Input.GetAxis ("Mouse ScrollWheel") * Time.deltaTime * zoomRate * Mathf.Abs (desiredDistance); 
        desiredDistance = Mathf.Clamp (desiredDistance, minDistance, maxDistance); 
        correctedDistance = desiredDistance; 
		

        vTargetOffset = new Vector3 (0, -targetHeight, 0);
        Vector3 position = target.position - (rotation * Vector3.forward * desiredDistance + vTargetOffset); 

        RaycastHit collisionHit; 
        Vector3 trueTargetPosition = new Vector3 (target.position.x, target.position.y + targetHeight, target.position.z); 

      
        bool isCorrected = false; 
        if (Physics.Linecast (trueTargetPosition, position, out collisionHit, collisionLayers.value)) 
        { 
            correctedDistance = Vector3.Distance (trueTargetPosition, collisionHit.point) - offsetFromWall; 
            isCorrected = true;
        }

        currentDistance = !isCorrected || correctedDistance > currentDistance ? Mathf.Lerp (currentDistance, correctedDistance, Time.deltaTime * zoomDampening) : correctedDistance; 
        currentDistance = Mathf.Clamp (currentDistance, minDistance, maxDistance); 

        position = target.position - (rotation * Vector3.forward * currentDistance + vTargetOffset); 
        
        transform.rotation = rotation; 
        transform.position = position; 
	
    } 

    private static float ClampAngle (float angle, float min, float max) 
    { 
        if (angle < -360) 
            angle += 360; 
        if (angle > 360) 
            angle -= 360; 
        return Mathf.Clamp (angle, min, max); 
    } 
} 
