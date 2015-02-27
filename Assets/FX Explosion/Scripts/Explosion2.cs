using UnityEngine;
using System.Collections;

public class Explosion2 : MonoBehaviour
{
    private string FxName;

    public void Awake()
    {
        name = "FxExplo" + Time.frameCount;
        FxName = this.name;
        GameObject.Find(this.FxName).transform.eulerAngles = new Vector3((float) 0, (float) Random.Range(0, 360), (float) 0);
    }

    public void Main()
    {
    }

    public void Update()
    {
        GameObject.Find(this.FxName + "/ExploLight").light.range -= 6.5f * Time.deltaTime;
        Destroy(this.gameObject, (float) 5);
    }
}

