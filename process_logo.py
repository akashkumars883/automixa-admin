from PIL import Image

def process_logo(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # If the pixel is near-white (background), make it transparent
            if item[0] > 200 and item[1] > 200 and item[2] > 200:
                newData.append((255, 255, 255, 0))
            else:
                # If it's a dark pixel (the logo), make it white, keeping original alpha
                newData.append((255, 255, 255, item[3]))
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Successfully processed logo.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_logo(r"d:\Full Stack Dev\automixa-admin\public\logo.png", r"d:\Full Stack Dev\automixa-admin\public\logo-white.png")
