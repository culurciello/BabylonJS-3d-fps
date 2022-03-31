# 

from flask import Flask, render_template

from livereload import Server

app = Flask(__name__)
app.debug = True

@app.route('/')
@app.route('/index', methods=['GET', 'POST'])
def index():
    return render_template('index.html', title='Home')
        
# @app.route("/get")
#   return render_template,

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve()
