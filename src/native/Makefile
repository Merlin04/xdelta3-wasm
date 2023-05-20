# http://philiplassen.com/2021/08/11/node-es6-emscripten.html

FLAGS = -Os \
		-s STANDALONE_WASM \
		-s MODULARIZE \
		-s EXPORT_ES6 \
		-s EXPORT_NAME=loadWasm \
		-s EXPORTED_FUNCTIONS="['_malloc', '_free', '_xd3_encode_memory', '_xd3_decode_memory', '_xd3_strerror']" \
		--no-entry

BASE=.
OBJS=./out
CFLAGS=-O2 -I $(BASE)/xdelta/xdelta3 -D XD3_USE_LARGESIZET=0 -D XD3_USE_LARGEFILE64=0 -D SIZEOF_SIZE_T=4

build:
	mkdir -p $(OBJS)
	emcc -c $(BASE)/xdelta/xdelta3/xdelta3.c -o $(OBJS)/xdelta3.o $(CFLAGS)
	emcc -o $(BASE)/xdelta3.wasm $(OBJS)/xdelta3.o $(FLAGS)

clean: 
	rm -r $(OBJS) $(BASE)/xdelta3.wasm

all: build