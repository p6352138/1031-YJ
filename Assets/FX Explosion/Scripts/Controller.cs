using UnityEngine;
using System.Collections;

public class Controller : MonoBehaviour
{
    public GameObject Effekt1;
    public GameObject Effekt2;
    public GameObject Effekt3;
    public Texture2D itemTexture;

    public void Main()
    {
    }

    public void OnGUI()
    {
        GUI.depth = 0;
        GUI.DrawTexture(new Rect((float) 0, (float) 440, (float) this.itemTexture.width, (float) this.itemTexture.height), this.itemTexture);
    }

    public void Update()
    {
        if (Input.GetButtonDown("Effekt1"))
        {
            Instantiate(this.Effekt1, this.transform.position, this.transform.rotation);
        }
        if (Input.GetButtonDown("Effekt2"))
        {
            Instantiate(this.Effekt2, this.transform.position, this.transform.rotation);
        }
        if (Input.GetButtonDown("Effekt3"))
        {
            Instantiate(this.Effekt3, this.transform.position, this.transform.rotation);
        }
    }
}

