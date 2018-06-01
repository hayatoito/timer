# Makefile for local test

OUTPUT=$(HOME)/src/build/timer

BIN=$(HOME)/src/yarn/node_modules/.bin

build:
	mkdir -p $(OUTPUT)
	$(BIN)/eslint pomodoro-timer.babel.js && \
	$(BIN)/babel --presets babel-preset-es2015 --compact false pomodoro-timer.babel.js -o $(OUTPUT)/pomodoro-timer.js
	rsync -a pomodoro-timer.html index.js assets bower_components $(OUTPUT)/
	cp index.html $(OUTPUT)/index.tmp.html
	$(BIN)/vulcanize $(OUTPUT)/index.tmp.html --inline-script --inline-css --strip-comments | $(BIN)/crisper -h $(OUTPUT)/index.html -j $(OUTPUT)/timer.js
	rm -rf $(OUTPUT)/bower_components

update:
	bower install

watch:
	fswatch -o -e '#.*' *.html *.babel.js | xargs -n 1 -I {} make build

serve:
	browser-sync start --port 8000 --server --files='*.html,*.js'

publish: build
	git branch -D master || true
	python3 ./ghp-import/ghp_import.py -b master $(OUTPUT)
	git push --force origin master

# https://hayatoito.github.io/timer
# -> Redirects to
# https://hayato.io/timer

.PHONY: build update watch
