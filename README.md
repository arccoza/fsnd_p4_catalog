# fsnd_p4_catalog

## Install & Run

You can skip this and view an online version, linked in the View section.

* Make sure [vagrant](https://www.vagrantup.com/) is installed.

* Clone this repo with `git clone git@github.com:arccoza/fsnd_p4_catalog.git catalog` into your FSND VM.

* Or clone my FSND VM with this project included: `git clone git@github.com:arccoza/fsnd_p3_vm.git`.

* From the terminal inside the project directory run `vagrant up`.

* SSH into the VM from the terminal once the VM is up: `vagrant ssh`.

* Move into the project directory in the VM: `cd /vagrant/catalog`.

* Run `pip3 install -r requirements.txt -t lib` to install dependencies.

* Run the dev server with `python3 app.py`.

## View

* On your host machine open: [http://localhost:5000/](http://localhost:5000/)

* Or you can view an online version [here](http://188.166.100.114.xip.io/).

## Use

From the top left of the page you can open a side panel that will allow you to navigate by category or return home.

From the top right you can signin or signup with a Facebook or Google account.

If you are signed-in a FAB button in the bottom right should appear allowing you to add Categories and Items.

When you are signed-in you can edit Categories and Items by clicking on the pencil icon next to each.
