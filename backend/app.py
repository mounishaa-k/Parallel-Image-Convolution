from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

from hpc import process_image

app = Flask(__name__)
CORS(app)

@app.route("/process", methods=["POST"])
def process():
    file = request.files["image"]
    filter_name = request.form.get("filter", "sharpen")

    input_path = "input.jpg"
    output_path = "output.jpg"

    file.save(input_path)

    runtime, throughput = process_image(input_path, filter_name, output_path)

    with open(output_path, "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode()

    return jsonify({
        "image": img_base64,
        "runtime": runtime,
        "throughput": throughput,
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)