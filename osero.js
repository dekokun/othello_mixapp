var Board = new Class({
  initialize : function(row, height){
    this.row = row || 8;
    this.height = height || 8;
    this.matrix = [];
    var self = this;
    (8).times(function(x){
      self.matrix[x] = [];
      (8).times(function(y){
        self.matrix[x][y] = null;
      });
    });
    this.stones = ['b', 'w'];
  },
  get : function(x, y) {
    return this.matrix[x][y];
  },
  set : function(x, y, stone) {
    this.matrix[x][y] = stone;
  },
  not_selected_areas : function() {
    var areas = [];
    var self = this;
    self.row.times(function(x) {
      self.height.times(function(y) {
        if(self.get(x, y) == null)
          areas.push([x, y]);
      });
    });
    return areas;
  },
  count : function() {
    var self = this;
    var r = {};
    self.stones.each(function(stone) {
      r[stone] = 0;
    });
    self.row.times(function(x){
      self.height.times(function(y){
        self.stones.each(function(stone) {
          if(self.get(x, y) == stone)
            r[stone]++;
        });
      });
    });
    return r;
  }
});

var Rule = new Class({
  initialize : function(board){
    this.board = board;
    this.colors = ['b', 'w'];
    this.turn = null;
  },
  start : function(){
    this.board.set(3, 3, 'a');
    this.board.set(4, 3, 'b');
    this.board.set(3, 4, 'b');
    this.board.set(4, 4, 'a');
    this.turn = 'b';
  },
  turnchange : function(){
    var self = this;
    this.turn = this.colors.filter(function(i){return i != self.turn})[0];
  },
  pass : function(color) {
    if(this.turn == color)
      this.turnchange();
  },
  is_selectable : function(x, y, color){
    //check reversable
    return (this.board.get(x, y) != color);
  },
  select : function(x, y, color){
    if(this.turn == color && this.is_selectable(x, y, color)) {
      this.board.set(x, y, color);
      this.turnchange();
      return true;
    } else {
      return false;
    }
  },
  reversables : function() {
    var self = this;
    this.board.not_selected_areas.each(function(c){
      self.reverse_columns(x, y);
    });
  },
  reverse_columns : function(x, y) {
    var self = this;
    var rv = [];
    /*
    var reversable = false;
    [-7, -8, -9, 7, 8, 9, -1, 1].each(function(h){
      var m = n + 1;
      var c = m + h,l = x(m), r = true;
      //console.log(l)
      while(c > 0 && 8 * 8 + 1 > c && l > 0 && 9 > l && r) {
        var o = board[c -1];
        console.log(o)
        if(o.team == t) {
          r = false;
          reversable = true;
        } else if(o.team == (t == 'a' ? 'b' : 'a')) {
          rv.push(c - 1);
          (8 > h) ? ++l : (8 < h ? ++l : null)
          c += h;
        } else {
          r = false;
        }
      }
    });
    */
    return rv;
  },
  game_set : function() {
    this.board
  }
});

var Ai = new Class({
  initialize : function(name, color, communicator) {
    this.name = name;
    this.color = color;
    this.communicator = communicator;
  },
  turn : function(){
    //return this.board.not_selected_areas().getRandom();
    //
  }
});

var Player = new Class({
  initialize : function(name, color, communicator){
    var self = this;
    this.name = name;
    this.color = color;
    this.communicator = communicator;
    this.ui = new PlayerUI('main');
    this.ui.add_event('click', function(x, y){self.put_stone(x, y)});
  },
  turn : function() {
  },
  put_stone : function(x, y) {
    this.communicator.select(x, y, this.color);
  }
});

var PlayerUI = new Class({
  initialize : function(stage){
    var self = this;
    this.stage = $(stage);
    this.board = new BoardUI(this.stage);
    this.board.add_event('click', function(x, y){
      self.fire_event('click', x, y);
    });
    this.event_hundlers = [];
  },
  add_event : function(name, func){
    if(!this.event_hundlers[name])
      this.event_hundlers[name] = [];
    this.event_hundlers[name].push(func);
  },
  fire_event : function() {
    var args = $A(arguments);
    var name = args.shift();
    if(this.event_hundlers[name])
      this.event_hundlers[name].each(function(f){f.apply(null, args)});
  }
});

var BoardUI = new Class({
  initialize : function(stage){
    var self = this;
    this.theme = DefaultTheme;
    this.base = new Element('div', {
      styles : self.theme.base
    });
    (8).times(function(x){
      (8).times(function(y){
        var elm = new Element('div', {
          styles : self.theme.column,
          events : {
            'click' : function(){
              self.fire_event('click', x, y);
            }
          }
        });
        self.base.adopt(elm);
      });
    });
    $(stage).empty().adopt(this.base);
    this.event_hundlers = [];
  },
  add_event : function(name, func){
    if(!this.event_hundlers[name])
      this.event_hundlers[name] = [];
    this.event_hundlers[name].push(func);
  },
  fire_event : function() {
    var args = $A(arguments);
    var name = args.shift();
    if(this.event_hundlers[name])
      this.event_hundlers[name].each(function(f){f.apply(null, args)});
  }
});

var DefaultTheme = {
  base : {
    'width' : '160px'
  },
  column : {
            'width' : '18px',
            'height' : '18px',
            'line-height' : '18px',
            'border' : '1px solid #000',
            'float' : 'left',
            'text-align' : 'center',
            'cursor' : 'pointer'
          }
}

var Communicator = new Class({
  initialize : function(game) {
    this.game = game;
    this.stones = ['b', 'w'];
  },
  start : function() {
  },
  select : function(x, y, color) {
    if(this.game.rule.is_selectable(x, y, color)) {
      this.game.rule.select(x, y, color);
      return true;
    } else {
      return false;
    }
  }
});

var Game = new Class({
  initialize : function(elm){
    this.elm = $(elm);
    this.playing = false;
  },
  start : function(){
    var self = this;
    this.communicator = new Communicator(this);
    this.players = [
      new Player('you', 'b', this.communicator),
      new Ai('enemy', 'w', this.communicator)
    ];
    this.board = new Board(DefaultTheme);
    this.rule = new Rule(this.board, this.players);
    this.playing = true;
    this.rule.start();
    this.communicator.start();
  }
});

