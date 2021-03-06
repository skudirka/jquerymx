/*
@page jquery.model.encapsulate Service Encapsulation
@parent jQuery.Model

<h1>Service / Ajax Encapsulation</h1>

Models encapsulate your application's raw data.  This promotes reuse and provide a 
standard interface for widgets to talk to services.

The majority of the time, the raw data comes from 
services your server provides.  For example, 
if you make a request to:

<pre><code>GET /contacts.json</code></pre>

The server might return something like:

<pre><code>[{
  'id': 1,
  'name' : 'Justin Meyer',
  'birthday': '1982-10-20'
},
{
  'id': 2,
  'name' : 'Brian Moschel',
  'birthday': '1983-11-10'
}]</code></pre>

In most jQuery code, you'll see something like the following to retrieve contacts
data:

@codestart
$.get('/contacts.json',
      {type: 'tasty'}, 
      successCallback,
      'json')</code></pre>
@codeend

Instead, model encapsulates (wraps) this request so you call it like:

@codestart
Contact.findAll({type: 'old'}, successCallback);
@codeend

And instead of raw data, findAll returns contact instances that let you do things like:

@codestart
// destroy the contact
contact.destroy() 

// update the contact
contact.update({name: "Jeremy"})

// create a contact
new Contact({name: "Alex"}).save();
@codeend

## Encapsulation Demo

The Grid demo shows using two different models with the same widget.

@demo jquery/model/demo-encapsulate.html

## How to Encapsulate

Think of models as a contract for creating, reading, updating, and deleting data. 
 
By filling out a model, you can pass that model to a widget and the widget will use 
the model as a proxy for your data.  

The following chart shows the methods most models provide:

<table>
    <tr>
        <td>Create</td><td><pre>Contact.create(attrs, success, error)</pre></td>
    </tr>
    <tr>
        <td>Read</td><td><pre>Contact.findAll(params,success,error)
Contact.findOne(params, success, error)</pre></td>
    </tr>
    <tr>
        <td>Update</td><td><pre>Contact.update(id, attrs, success, error)</pre></td>
    </tr>
    <tr>
        <td>Delete</td><td><pre>Contact.destroy(id, success, error)</pre></td>
    </tr>
</table>

By filling out these methods, you get the benefits of encapsulation, 
AND all the other magic Model provides.  

There are two ways to fill out these methods:

  - providing service urls
  - implementing the method
  
## Using Service URLS

If your server is REST-ish, you can simply provide
urls to your services.  

The following shows filling out a 
Task model's urls.  For each method it shows calling the function,
how the service request is made, and what the server's response
should look like:

    $.Model("Task",{
    
      // Task.findAll({foo: "bar"})
	  // -> GET /tasks.json?foo=bar
	  // <- [{id: 1, name: "foo"},{ ... }]
      findAll : "/tasks.json",    
      
      // Task.findOne({id: 5})
	  // -> GET /tasks/5.json
      findOne : "/tasks/{id}.json", 
      
      // new Task({name: 'justin'}).save()
	  // -> POST /tasks.json id=5
	  // <- {id : 5}
      create : "/tasks.json",
      
      // task.update({name: 'justin'})
	  // -> PUT /tasks/5.json name=justin
	  // <- {}
      update : "/tasks/{id}.json",
      
      // task.destroy()
	  // -> DESTROY /tasks/5.json
	  // <- {}
      destroy : "/tasks/{id}.json"
    },{})

You can change the HTTP request type by putting a GET, POST, DELETE, PUT like:

    $.Model("Todo",{
      destroy: "POST /task/delete/{id}.json
    },{})


<b>Note:</b> Even if your server doesn't respond with service data
in the same way, it's likely that $.Model will be able to figure it out.

##  Implement Service Methods

If providing a url doesn't work for you, you might need to fill out the
service method yourself.  

Lets see how we might fill out the
<code>Contact.findAll</code> function:

@codestart
$.Model.extend('Contact',
{
  findAll : function(params, success, error){
  
    // do the ajax request
    $.get('/contacts.json',
      params, 
      function( json ){ 
        
        // on success, create new Contact
        // instances for each contact
        var wrapped = [];
        
        for(var i =0; i< json.length;i++){
          wrapped.push( new Contact(json[i] ) );
        }
        
        //call success with the contacts
        success( wrapped );
        
      },
      'json');
  }
},
{
  // Prototype properties of Contact.
  // We'll learn about this soon!
});
@codeend

Well, that would be annoying to write out every time.  Fortunately, models have
the wrapMany method which will make it easier:

@codestart
findAll : function(params, success, error){
    $.get('/contacts.json',
      params, 
      function( json ){ 
        success(Contact.wrapMany(json));		
      },
      'json');
  }
@codeend

Model is based off JavaScriptMVC's <code>jQuery.Class</code>. It's callback allows us to pipe
wrapMany into the success handler and make our code even shorter:

@codestart
findAll : function(params, success, error){
    $.get('/contacts.json',
    params, 
    this.callback(['wrapMany', success]),
    'json')
  }
@codeend

If we wanted to make a list of contacts, we could do it like:

@codestart
Contact.findAll({},function(contacts){
  var html = [];
  for(var i =0; i < contacts.length; i++){
    html.push('&lt;li>'+contacts[i].name + '&lt;/li>')
  }
  $('#contacts').html( html.join('') );
});
@codeend


 */
//s