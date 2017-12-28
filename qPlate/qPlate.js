/*
Copyright (c) 2017 Christophe Matthieu
https://github.com/Gorash

Based on the qWeb of Fabien Meghazi, used by odoo

Released under the MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(module) {
"use strict";

var qPlate = {
    expressions_cache: { },
    RESERVED_WORDS: 'true,false,NaN,null,undefined,debugger,console,window,in,instanceof,new,function,return,this,typeof,eval,void,Math,RegExp,Array,Object,Date'.split(','),
    ACTIONS_PRECEDENCE: 'foreach,if,elif,else,tag,call,set,esc,raw,js,debug,log'.split(','),
    WORD_REPLACEMENT: {
        'not': '!',
        'and': '&&',
        'or': '||',
        'gt': '>',
        'gte': '>=',
        'lt': '<',
        'lte': '<='
    },
    VOID_ELEMENTS: 'area,base,br,col,embed,hr,img,input,keygen,link,menuitem,meta,param,source,track,wbr'.split(','),
    tools: {
        exception: function(message, context) {
            context = context || {};
            var prefix = 'qPlate';
            if (context.template) {
                prefix += " - template['" + context.template + "']";
            }
            throw new Error(prefix + ": " + message);
        },
        warning : function(message) {
            console.warn(message);
        },
        trim: function(s, mode) {
            switch (mode) {
                case "left":
                    return s.replace(/^\s*/, "");
                case "right":
                    return s.replace(/\s*$/, "");
                default:
                    return s.replace(/^\s*|\s*$/g, "");
            }
        },
        js_escape: function(s, noquotes) {
            return (noquotes ? '' : "'") + s.replace(/\r?\n/g, "\\n").replace(/'/g, "\\'") + (noquotes ? '' : "'");
        },
        html_unescape: function(s, attribute) {
            if (s == null) {
                return '';
            }
            s = String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            if (attribute) {
                s = s.replace(/&quot;/g, '"');
            }
            return s;
        },
        html_escape: function(s, attribute) {
            if (s == null) {
                return '';
            }
            s = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (attribute) {
                s = s.replace(/"/g, '&quot;');
            }
            return s;
        },
        gen_attribute: function(o) {
            if (o !== null && o !== undefined) {
                if (o.constructor === Array) {
                    if (o[1] !== null && o[1] !== undefined) {
                        return this.format_attribute(o[0], o[1]);
                    }
                } else if (typeof o === 'object') {
                    var r = '';
                    for (var k in o) {
                        if (o.hasOwnProperty(k)) {
                            r += this.gen_attribute([k, o[k]]);
                        }
                    }
                    return r;
                }
            }
            return '';
        },
        format_attribute: function(name, value) {
            return ' ' + name + '="' + this.html_escape(value, true) + '"';
        },
        extend: function(dst, src, exclude) {
            for (var p in src) {
                if (src.hasOwnProperty(p) && !(exclude && this.arrayIndexOf(exclude, p) !== -1)) {
                    dst[p] = src[p];
                }
            }
            return dst;
        },
        arrayIndexOf : function(array, item) {
            for (var i = 0, ilen = array.length; i < ilen; i++) {
                if (array[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        call: function(context, template, old_dict, _import, callback) {
            var new_dict = this.extend({}, old_dict);
            new_dict['__caller__'] = old_dict['__template__'];
            if (callback) {
                new_dict[0] = callback(context, new_dict);
            }
            return context.engine._render(template, new_dict);
        },
        foreach: function(context, enu, as, old_dict, callback) {
            if (enu != null) {
                var index, jlen, cur;
                var new_dict = this.extend({}, old_dict);
                new_dict[as + "_all"] = enu;
                var as_value = as + "_value",
                    as_index = as + "_index",
                    as_first = as + "_first",
                    as_last = as + "_last",
                    as_parity = as + "_parity";
                if (enu instanceof Array) {
                    var size = enu.length;
                    new_dict[as + "_size"] = size;
                    for (index = 0, jlen = enu.length; index < jlen; index++) {
                        cur = enu[index];
                        new_dict[as_value] = cur;
                        new_dict[as_index] = index;
                        new_dict[as_first] = index === 0;
                        new_dict[as_last] = index + 1 === size;
                        new_dict[as_parity] = (index % 2 == 1 ? 'odd' : 'even');
                        if (cur.constructor === Object) {
                            this.extend(new_dict, cur);
                        }
                        new_dict[as] = cur;
                        callback(context, new_dict);
                    }
                } else if (enu.constructor == Number) {
                    var _enu = [];
                    for (var i = 0; i < enu; i++) {
                        _enu.push(i);
                    }
                    this.foreach(context, _enu, as, old_dict, callback);
                } else {
                    index = 0;
                    for (var k in enu) {
                        if (enu.hasOwnProperty(k)) {
                            cur = enu[k];
                            new_dict[as_value] = cur;
                            new_dict[as_index] = index;
                            new_dict[as_first] = index === 0;
                            new_dict[as_parity] = (index % 2 == 1 ? 'odd' : 'even');
                            new_dict[as] = k;
                            callback(context, new_dict);
                            index += 1;
                        }
                      }
                }

                for (var z in old_dict) {
                    old_dict[z] = new_dict[z];
                }
            } else {
                this.exception("No enumerator given to foreach", context);
            }
        },
        deepFreeze: function (node) {
            for (var k=0; k<node.childNodes.length; k++) {
                this.deepFreeze(node.childNodes[k]);
            }
            Object.freeze(node);
        }
    }
};

qPlate.tools.parse = (function() {
    var space = /[\s\n\r\t]+/;

    function Node(parentNode, nodeType, tagName, content) {
        this.parentNode = parentNode;
        this.nodeType = nodeType;
        this.tagName = tagName;
        this.content = typeof content === 'string' ? content : null;
        this.childNodes = new Collection();
        this.attributes = {};
    }
    Node.prototype.previousNode = function () {
        var childNodes = this.parentNode.childNodes;
        var index = childNodes.indexOf(this) - 1;
        while(childNodes[index].nodeType !== 1) {
            index--;
        }
        return childNodes[index];
    };
    Node.prototype.nextNode = function () {
        var childNodes = this.parentNode.childNodes;
        var index = childNodes.indexOf(this) + 1;
        while(childNodes[index].nodeType !== 1) {
            index++;
        }
        return childNodes[index];
    };
    Node.prototype.previousSibling = function () {
        var childNodes = this.parentNode.childNodes;
        var index = childNodes.indexOf(this) - 1;
        return childNodes[index];
    };
    Node.prototype.nextSibling = function () {
        var childNodes = this.parentNode.childNodes;
        var index = childNodes.indexOf(this) + 1;
        return childNodes[index];
    };
    Node.prototype.outerHTML = function () {
        var html = '';
        if (this.nodeType === 8) {
            html += '<!--' + this.content + '-->';
        } else if (this.nodeType === 2 || this.nodeType === 3 || this.content) {
            html += this.content || '';
        } else {
            if (this.tagName) {
                html += '<' + this.tagName;
                for (var k in this.attributes) {
                    if (this.attributes[k].content !== null) {
                        html += ' ' + k + '="' + this.attributes[k].content.replace('"', '\\"') + '"';
                    }
                }
                html += '>';
            }
            for (var k=0; k<this.childNodes.length; k++) {
                html += this.childNodes[k].outerHTML();
            }
            if (this.tagName) {
                html += '</' + this.tagName + '>';
            }
        }
        return html;
    };
    Node.prototype.innerHTML = function () {
        var html = '';
        for (var k=0; k<this.childNodes.length; k++) {
            html += this.childNodes[k].outerHTML();
        }
        return html;
    };
    Node.prototype.toString = function () {
        return this.content !== null ? this.content : '';
    };
    Node.prototype.root = function () {
        var node = this;
        while (node.parentNode) {
            node = node.parentNode;
        }
        return node;
    };
    Node.prototype.cloneNode = function (deep) {
        var node = new Node(this.parentNode, this.nodeType, this.tagName, this.content);
        for (var k=0; k<this.childNodes.length; k++) {
            node.childNodes[k] = this.childNodes[k].cloneNode(deep);
        }
        for (var name in this.attributes) {
            node.attributes[name] = this.attributes[name].cloneNode(deep);
        }
        makeParentAndDescendant(node);
        return node;
    };

    // PARSING DOM

    function makeParentAndDescendant (node) {
        var res = new Collection();
        if (node.childNodes) {
            for (var k=0; k<node.childNodes.length; k++) {
                var child = node.childNodes[k];
                res.push(child);
                res = res.concat(makeParentAndDescendant(child));

                child.parentNode = node;
                for (var name in node.attributes) {
                    node.attributes[name].parentNode = node;
                }
            }   
        }
        return node.descendant = res;
    }
    function parseAttributes(string) {
        var obj = {};
        var key, open = false, value;
        for (var k=0; k<string.length; k++) {
            if (!open && space.test(string[k])) {
                continue;
            }
            if (open) {
                value = '';
                if (open === true) {
                    while(string[k] && !space.test(string[k])) {
                        value += string[k];
                        k++;
                    }
                } else {
                    while(string[k] && (string[k] !== open || string[k-1] === "\\")) {
                        value += string[k];
                        k++;
                    }
                }
                obj[key] = value;
                open = false;
            } else {
                key = '';
                while(string[k] && (!space.test(string[k])) && string[k] !== "=") {
                    key += string[k];
                    k++;
                }
                key = key.toLowerCase();
                obj[key] = key;
                if (string[k] === "=") {
                    if (string[k+1] === "'" || string[k+1] === '"') {
                        open = string[k+1];
                        k++;
                    } else {
                        open = true;
                    }
                }
            }
        }
        return obj;
    }
    function parse(template) {
        var arch = new Node(false, 9);
        arch.childNodes = new Collection();
        var node, path = [arch];
        // for (var k=0; k<qPlate.WORD_REPLACEMENT.length; k++) {
        //     template = template.replace(new RegExp(k, 'g'), qPlate.WORD_REPLACEMENT[k]);
        // }
        for (var k=0; k<template.length; k++) {
            if (template[k] === "<") { // begin an open or close tag
                var tagAll = "";
                k++;
                if (template[k] === "/") { // close tag
                    k++;
                    while(template[k] && template[k] !== ">") {
                        tagAll += template[k];
                        k++;
                    }
                    tag = tagAll.split(space)[0];
                    node = path[path.length-1];

                    if (node.tagName.toLowerCase() !== tag.toLowerCase()) {
                        qPlate.tools.exception("Invalid XML tags: '"+node.tagName+"' != '"+tag[0]+"'");
                    }

                    var attributes = parseAttributes(tagAll.slice(tag.length));
                    for (var name in attributes) {
                        if (node.attributes[name] !== undefined) {
                            qPlate.tools.exception("Invalid XML attributes: '"+attributes[name]+"'");
                        }
                        node.attributes[name] = new Node(node, 2, name, attributes[name]);
                    }
                    path.pop();
                } else if (template[k] === "!" && template.substr(k, 3) === "!--") { // comment
                    k += 3;
                    var comment = "";
                    while(template[k] && (template[k] !== "-" || template[k+1] !== "-" || template[k+2] !== ">")) {
                        comment += template[k];
                        k++;
                    }
                    k += 2;
                    path[path.length-1].childNodes.push(
                        new Node(path[path.length-1], 8, null, comment)
                    );
                } else if (template[k] === "!" && template.substr(k, 8).toLowerCase() === "![cdata[") { // text cdata
                    k += 8;
                    var comment = "";
                    while(template[k] && (template[k] !== "]" || template[k+1] !== "]" || template[k+2] !== ">")) {
                        comment += template[k];
                        k++;
                    }
                    k += 2;
                    path[path.length-1].childNodes.push(
                        new Node(path[path.length-1], 3, null, comment)
                    );
                } else if (template[k] === "!" && template.substr(k, 8).toLowerCase() === "!doctype") { // text cdata
                    while(template[k] && template[k] !== ">") {
                        tagAll += template[k];
                        k++;
                    }
                    path[path.length-1].childNodes.push(
                        new Node(path[path.length-1], 3, null, "<" + tagAll + ">")
                    );
                } else { // open tag
                    var xmlNode = template[k] === "?";
                    while(template[k] && (template[k] !== ">" && (template[k] !== "/" || template[k+1] !== ">"))) {
                        tagAll += template[k];
                        k++;
                    }
                    var tag = tagAll.split(space)[0];
                    node = new Node(path[path.length-1], xmlNode ? 9 : 1, tag);

                    var attributes = parseAttributes(tagAll.slice(tag.length));
                    for (var name in attributes) {
                        if (node.attributes[name] !== undefined) {
                            qPlate.tools.exception("Invalid XML attributes: '"+attributes[name]+"'");
                        }
                        node.attributes[name] = new Node(node, 2, name, attributes[name]);
                    }

                    path[path.length-1].childNodes.push(node);

                    // void
                    if (template[k] === "/") {
                        k++;
                    } else if (!xmlNode) {
                        path.push(node);
                    }
                }
            } else { // text
                var text = template[k];
                while(template[k] && template[k+1] !== "<") {
                    k++;
                    text += template[k];

                    if (template[k] === ">") {
                        qPlate.tools.exception("Invalid XML text: '"+text+"'");
                    }
                }
                path[path.length-1].childNodes.push(
                    new Node(path[path.length-1], 3, null, text)
                );
            }
        }
        makeParentAndDescendant(arch);
        return arch;
    }

    // END PARSING DOM

    // XPATH

    Node.prototype.xpath = function (xpath) {
        var t = Date.now();
        var xpathArch = parseXpath(xpath);
        var collection = new Collection();
        collection.push(this);
        return useXpath(collection, this, xpathArch);
    };

    var regOperation = /^((or|[|]|and|div|mod|[-+])(?=[\s\n\r\t|(])|([*]=|%=|[?]=|[=<>]+))/;
    var regAxe = /^((\.?\.?[//]+)(([^\\\/\[\](){}'"\s=<>+.@%*]+)::)?([^\\\/\[\](){}'"\s=<>+.@%]+)?|([^\\\/\[\](){}'"\s=<>+.@%*]+)::([^\\\/\[\](){}'"\s=<>+.@%]+)?|([^\\\/\[\](){}'"\s=<>+.@%]+))/;
    var regAxeAttribute = /^@([^\\\/\[\](){}'"\s=<>+.@%]+)/;
    var regGroup = /^([([\]),])/;
    var regText = /^"@([0-9]+)"/;
    var regSpace = /^[\s\n\r\t]+/;
    function parseXpath (xpath) {
        var result = splitXpathString(xpath);
        var string = result[1];
        var xpathCopy = result[0];
        var node = {children: []};
        var arch = node;
        var newNode, exp, value;

        while (xpathCopy.length) {
            if (exp = regGroup.exec(xpathCopy)) { // group & filter & method
                if (exp[0] === "(") {
                    if (node.children.length &&
                            node.children[node.children.length-1].type === "tagName" &&
                            xpathCopy[1] !== '/' &&
                            xpathCopy[1] !== '.') {
                        newNode = {
                            type: 'method',
                            value: node.children.pop().value,
                            children: [],
                            parent: node,
                        };
                    } else {
                        newNode = {
                            type: 'group',
                            children: [],
                            parent: node,
                        };
                    }
                    node.children.push(newNode);
                    node = newNode;
                } else if (exp[0] === "[") {
                    newNode = {
                        type: 'filter',
                        children: [],
                        parent: node,
                    };
                    node.children.push(newNode);
                    node = newNode;
                } else if (exp[0] === "]" || exp[0] === ")") {
                    node = node.parent;
                    if (!node) {
                        qPlate.tools.exception('xpath error: ' + xpath);
                    }
                } else if (exp[0] === ",") {
                    node = node.parent;
                    if (!node) {
                        qPlate.tools.exception('xpath error: ' + xpath);
                    }
                    newNode = {
                        type: 'group',
                        children: [],
                        parent: node,
                    };
                    node.children.push(newNode);
                    node = newNode;
                }
            }
            else if (exp = regOperation.exec(xpathCopy)) { // operation
                node.children.push({
                    type: 'operation',
                    value: exp[2] || exp[3],
                    parent: node,
                });
            }
            else if (exp = regAxe.exec(xpathCopy)) { // axe
                if (exp[2]) {
                    value = exp[2];
                    if (value[0] === "/" && !node.children.length) {
                        node.children.push({
                            type: 'axe',
                            value: 'root',
                            parent: node,
                        });
                    }
                    else if (value.indexOf('..') !== -1) {
                        node.children.push({
                            type: 'axe',
                            value: 'parent',
                            parent: node,
                        });
                        value = value.substr(value[0] === "/" ? 3 : 2);
                    }
                    if (value === "/" || exp[2] === "./") {
                        node.children.push({
                            type: 'axe',
                            value: 'child',
                            parent: node,
                        });
                    }
                    else {
                        node.children.push({
                            type: 'axe',
                            value: 'descendant-or-self',
                            parent: node,
                        });   
                    }
                }
                if (exp[4] || exp[6]) {
                    node.children.push({
                        type: 'axe',
                        value: exp[4] || exp[6],
                        parent: node,
                    });
                }
                value = exp[5] || exp[8];
                if (value) {
                    if (isNaN(value)) {
                        node.children.push({
                            type: 'tagName',
                            value: value,
                            parent: node,
                        });
                    } else {
                        node.children.push({
                            type: 'number',
                            value: +value,
                            parent: node,
                        });
                    }
                }
            }
            else if (exp = regAxeAttribute.exec(xpathCopy)) { // axe attributes
                node.children.push({
                    type: 'attribute',
                    value: exp[1],
                    parent: node,
                });
            }
            else if (exp = regText.exec(xpathCopy)) { // text
                node.children.push({
                    type: 'string',
                    value: string[exp[1]],
                    parent: node,
                });
            }
            else if (exp = regSpace.exec(xpathCopy)) { // remove space
            }

            if (exp) {
                xpathCopy = xpathCopy.substr(exp[0].length);
            } else {
                qPlate.tools.exception('xpath parser missing: ' + xpath);
            }
        }

        operationToMethod(arch);
        cleanXpathArch(arch);

        return arch;
    }
    var regXpathString = /([\\]*(['"]))|([^'"\\]+)|([\\])/g;
    function splitXpathString (xpath) {
        var result = '';
        var xpathList = [];
        var string = [];
        while ((exp = regXpathString.exec(xpath))) {
            xpathList.push(exp);
        }
        if (xpathList.length === 1) {
            return [xpath, string];
        }
        for (var k=0; k<xpathList.length; k++) {
            var next = xpathList[k];
            var sign = next[2];
            var x = next[0];
            var open = sign && x.length % 2;
            if (!open) {
                result += x;
                continue;
            }
            while (xpathList[k+1]) {
                next = xpathList.splice(k+1, 1)[0];
                x += next[0];
                if (sign === next[2] && next[0].length % 2) {
                    open = 0;
                    break;
                }
            }
            result += '"@'+string.length+'"';
            string.push(JSON.parse(x));

            if (open) {
                qPlate.tools.exception('xpath error: ' + x);
            }
        }
        return [result, string];
    }
    function operationToMethod (arch) {
        delete arch.parent;

        if (!arch.children) {
            return;
        }

        var children = [];
        for (var k=0; k<arch.children.length; k++) {
            var node = arch.children[k];
            if (node.type === "operation") {
                var operation = {
                    type: 'method',
                    value: 'xpathOpperation',
                    children: [
                        {
                            type: 'group',
                            children: children,
                        },
                        {
                            type: 'string',
                            value: node.value,
                        },
                        {
                            type: 'group',
                            children: arch.children.splice(k+1),
                        }
                    ],
                    parent: arch,
                };
                children = [operation];
            } else {
                children.push(node);
            }
        }

        for (var k=0; k<children.length; k++) {
            operationToMethod(children[k]);
        }

        arch.children = children;
    }
    function cleanXpathArch (arch) {
        if (!arch.children) {
            return arch;
        }
        if (arch.type === "group" && arch.children.length === 1) {
            return cleanXpathArch(arch.children[0]);
        }
        for (var k=0; k<arch.children.length; k++) {
            arch.children[k] = cleanXpathArch(arch.children[k]);
        }
        return arch;
    }
    function useXpath (parent, node, arch) {
        switch (arch.type) {
            case 'axe':
                if (!node['_xpathAxe_' + arch.value]) {
                    qPlate.tools.exception('xpath error: axe undefined: ' + arch.value);
                }
                return node['_xpathAxe_' + arch.value]();
            case 'tagName': return node._xpathTagName(arch.value);
            case 'attribute': return node._xpathAttribute(arch.value);
            case 'filter':
                var subArch = arch.children[0];
                node = node._xpathFilter(function (n) {
                    return useXpath(node, n, subArch);
                });
                return node;
            case 'method':
                var fn = node['_xpathMethod_' + arch.value];
                if (!fn) {
                    qPlate.tools.exception('xpath error: method undefined: ' + arch.value);
                }
                var results = new Collection();
                var unique = false;
                if (node instanceof Node) {
                    node = new Collection(node);
                    unique = true;
                }
                for (var u=0; u<node.length; u++) {
                    var args = Collection();
                    for (var k=0; k<arch.children.length; k++) {
                        args.push(useXpath(parent, node[u], arch.children[k]));
                    }
                    args.push(parent);
                    results.push(fn.apply(node[u], args));
                }
                return unique ? results[0] : results;
            case 'string': return arch.value;
            case 'number': return arch.value;
            case 'group':
            default:
                for (var k=0; k<arch.children.length; k++) {
                    var nextnode = useXpath(parent, node, arch.children[k]);
                    parent = node;
                    node = nextnode;
                }
                if (arch.type === 'group') {
                    if (!(node instanceof Collection)) {
                        node = new Collection(node);
                    }
                    node.group = true;
                }
                return node;
        }
    }

    // filter
    Node.prototype._xpathFilter = function (callback) {
        var res = callback(this);
        return res && (!(res instanceof Collection) || res.length) ? this : new Collection();
    }
    // axe
    Node.prototype._xpathAxe_root = function () {
        var root = this;
        while (root.parentNode) {
            root = root.parentNode;
        }
        return root;
    }
    Node.prototype['_xpathAxe_descendant-or-self'] = function () {
        var result = this.descendant.slice();
        result.unshift(this);
        return result;
    }
    Node.prototype._xpathAxe_parent = function () {
        return this.parentNode;
    }
    Node.prototype._xpathAxe_child = function () {
        return this;
    }
    Node.prototype._xpathTagName = function (tagName) {
        tagName = tagName.toLowerCase();
        var result = new Collection();
        var childNodes = this.childNodes;
        for (var u=0; u<childNodes.length; u++) {
            if (childNodes[u].nodeType === 1 && (childNodes[u].tagName && (tagName === "*" || childNodes[u].tagName.toLowerCase() === tagName))) {
                result.push(childNodes[u]);
            }
        }
        return result;
    }
    // methods
    Node.prototype._xpathMethod_xpathOpperation = function (v1, op, v2) {
        switch (op) {
            case '+':  return this._xpathMethod_number(v1) + this._xpathMethod_number(v2);
            case '-':  return this._xpathMethod_number(v1) - this._xpathMethod_number(v2);
            case 'div':  return this._xpathMethod_number(v1) / this._xpathMethod_number(v2);
            case 'mod':  return this._xpathMethod_number(v1) % this._xpathMethod_number(v2);
            case 'and':
                if (!(v1 instanceof Collection) || !(v2 instanceof Collection)) {
                    return v1 && v2;
                }
                var result = new Collection();
                for (var k=0; k<v1.length; k++) {
                    if (v2.hasNode(v1[k])) {
                        result.push(v1[k]);
                    }
                }
                return result;
            case 'or':
                if (!(v1 instanceof Collection) || !(v2 instanceof Collection)) {
                    return v1 || v2;
                }
                var result = v1.slice();
                for (var k=0; k<v2.length; k++) {
                    if (!result.hasNode(v2[k])) {
                        result.push(v2[k]);
                    }
                }
                return result;
        }

        if (!(v1 instanceof Array)) {
            v1 = new Collection(v1);
        }
        if (v2 instanceof Collection && v2.length > 1) {
            v2 = v2[0];
            qPlate.tools.warning('maximum 1 value for comparaison operation');
        }
        var vv2 = v2 && (v2.nodeType === 2 || v2.nodeType === 3) ? v2.content : v2;

        for (var k=0; k<v1.length; k++) {
            var node = v1[k];
            var vv1 = node && (node.nodeType === 2 || node.nodeType === 3) ? node.content : node;
            switch (op) {
                case '=':  if (vv1 == vv2) return true;
                    continue;
                case '!=': if (vv1 != vv2) return true;
                    continue;
                case '<':  if (vv1 < vv2) return true;
                    continue;
                case '<=': if (vv1 <= vv2) return true;
                    continue;
                case '>':  if (vv1 > vv2) return true;
                    continue;
                case '>=': if (vv1 >= vv2) return true;
                    continue;
                case '*=': if (!!vv1 && (vv1 instanceof Node ? vv1._xpathMethod_text().join('') : vv1 + '').indexOf(vv2) !== -1) return true;
                    continue;
                case '%=': if (!!vv1 && (vv1 instanceof Node ? vv1._xpathMethod_text().join('') : vv1 + '').match(new RegExp(vv2.replace(/([[\]{}().+?])/g, '\\\$1').replace('%', '.*')))) return true;
                    continue;
                case '?=': if (!!vv1 && (vv1 instanceof Node ? vv1._xpathMethod_text().join('') : vv1 + '').match(new RegExp(vv2))) return true;
                    continue;
            }
        }
        return false;
    };
    Node.prototype._xpathMethod_not = function (value) {
        if (!value) {
            return true;
        } else if (value instanceof Collection) {
            for (var k=0; k<value.length; k++) {
                var node = value[k];
                if (node.nodeType === 9 || node.content) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    Node.prototype._xpathMethod_string = function (value) {
        return value instanceof Collection ? value.join('') : '' + ('content' in value ? value.content : value);
    };
    Node.prototype._xpathMethod_number = function (value) {
        return Number('content' in value ? !value.content : !value);
    };
    Node.prototype._xpathMethod_concat = function (/*val1, val2...*/) {
        var value = '';
        for (var k=0; k<arguments.length; k++) {
            value += this._xpathMethod_string(arguments[k]);
        }
        return value;
    };
    Node.prototype._xpathMethod_true = function () {
        return true;
    };
    Node.prototype._xpathMethod_false = function () {
        return false;
    };
    Node.prototype._xpathMethod_count = function (nodes) {
        return nodes instanceof Collection ? nodes.length : 0;
    };
    Node.prototype._xpathMethod_sum = function (nodes) {
        var value = 0;
        for (var k=0; k<nodes.length; k++) {
            value += this._xpathMethod_number(arguments[k]);
        }
        return value;
    };
    Node.prototype._xpathMethod_floor = function (value) {
        return Math.floor(value);
    };
    Node.prototype._xpathMethod_ceiling = function (value) {
        return Math.ceil(value);
    };
    Node.prototype._xpathMethod_round = function (value) {
        return Math.round(value);
    };
    Node.prototype._xpathMethod_position = function (collection) {
        return collection._getSublistOf(this).indexOf(this);
    };
    Node.prototype._xpathMethod_last = function (collection) {
        var list = collection._getSublistOf(this);
        return list.length-1;
    };
    Node.prototype._xpathMethod_text = function () {
        var result = new Collection();
        if (this.nodeType === 3) {
            result.push(this);
        } else {
            for (var k=0; k<this.childNodes.length; k++) {
                result.push.apply(result, this.childNodes[k]._xpathMethod_text());
            }   
        }
        return result;
    };
    Node.prototype._xpathAttribute = function (name) {
        name = name.toLowerCase();
        var result = new Collection();
        for (var n in this.attributes) {
            var attr = this.attributes[n];
            if (name === "*" || attr.tagName.toLowerCase() === name) {
                result.push(attr.cloneNode());
            }
        }
        if (!result.length && name !== "*") {
            result.push(new Node(this, 2, name, null));
        }
        return result;
    };
    Node.prototype._xpathMethod_contains = function (parentNodes, nodes) {
        var result = new Collection();
        for (var k=0; k<nodes.length; k++) {
            var node = nodes[k];
            while (node.parentNode) {
                node = node.parentNode;
                if (parentNodes.indexOf(node) !== -1) {
                    result.push(nodes[k]);
                    break;
                }
            }
        }
        return result;
    };

    // END XPATH

    // Collection

    function Collection(len) {
        var inst = len == null ? new Array() : new Array(len);
        inst.__proto__ = Collection.prototype;
        return inst;
    }
    Collection.prototype = Object.create(Array.prototype);

    // the Collection returns Collection
    function addArrayToCollectionMethod (methodName) {
        var method = Array.prototype[methodName];
        Collection.prototype[methodName] = function () {
            var value = method.apply(this, arguments);
            var array = new Collection();
            array.push.apply(array, value);
            return array;
        };
    }
    addArrayToCollectionMethod('slice');
    addArrayToCollectionMethod('splice');
    addArrayToCollectionMethod('concat');

    Collection.prototype.hasNode = function (node) {
        for (var u=0; u<this.length; u++) {
            if (this[u] === node) {
                return true;
            }
        }
        return false;
    };
    Collection.prototype.outerHTML = function () {
        var result = [];
        for (var u=0; u<this.length; u++) {
            result.push(this[u].outerHTML());
        }
        return result.join(',');
    };
    Collection.prototype.replace = function (Collection) {
        if (!this.length) {
            return;
        }
        if (this[0].nodeType === 2) {
            var content = Collection[0] && Collection.outerHTML();
            for (var k=0; k<this.length; k++) {
                var node = this[k];
                if (content) {
                    node.content = content;
                    node.parentNode.attributes[node.tagName] = node;
                }
            }
        } else {
            for (var k=0; k<this.length; k++) {
                var node = this[k];
                var childNodes = node.parentNode.childNodes;
                var index = childNodes.indexOf(node);
                var args = Collection.cloneNode(true);
                args.unshift(index, 1);
                childNodes.splice.apply(childNodes, args);
            }
            makeParentAndDescendant(this[0].root());
        }
    };
    Collection.prototype.prepend = function (Collection) {
        if (!this.length) {
            return;
        }
        if (this[0].nodeType === 2) {
            var content = Collection[0] && Collection.outerHTML();
            for (var k=0; k<this.length; k++) {
                var node = this[k];
                if (content) {
                    node.content = content + (node.content || '');
                    node.parentNode.attributes[node.tagName] = node;
                }
            }
        } else {
            for (var k=0; k<this.length; k++) {
                var node = this[k];
                var childNodes = node.childNodes;
                var args = Collection.cloneNode(true);
                childNodes.unshift.apply(childNodes, args);
            }
            makeParentAndDescendant(this[0].root());
        }
    };
    Collection.prototype.append = function (Collection) {
        if (!this.length) {
            return;
        }
        if (this[0].nodeType === 2) {
            var content = Collection[0] && Collection.outerHTML();
            for (var k=0; k<this.length; k++) {
                var node = this[k];
                if (content) {
                    node.content = (node.content || '') + content;
                    node.parentNode.attributes[node.tagName] = node;
                }
            }
        } else {
            for (var k=0; k<this.length; k++) {
                var node = this[k];
                var childNodes = node.childNodes;
                var args = Collection.cloneNode(true);
                childNodes.push.apply(childNodes, args);
            }
            makeParentAndDescendant(this[0].root());
        }
    };
    Collection.prototype.inner = function (Collection) {
        if (!this.length) {
            return;
        }
        if (this[0].nodeType === 2) {
            qPlate.tools.exception('cannot use operation "inner" on attributes');
        }
        for (var k=0; k<this.length; k++) {
            var node = this[k];
            node.childNodes = Collection.cloneNode(true);
        }
        makeParentAndDescendant(this[0].root());
    };
    Collection.prototype.before = function (Collection) {
        if (!this.length) {
            return;
        }
        if (this[0].nodeType === 2) {
            qPlate.tools.exception('cannot use operation "before" on attributes');
        }
        for (var k=0; k<this.length; k++) {
            var node = this[k];
            var childNodes = node.parentNode.childNodes;
            var index = childNodes.indexOf(node);
            var args = Collection.cloneNode(true);
            args.unshift(index, 0);
            childNodes.splice.apply(childNodes, args);
        }
        makeParentAndDescendant(this[0].root());
    };
    Collection.prototype.after = function (Collection) {
        if (!this.length) {
            return;
        }
        if (this[0].nodeType === 2) {
            qPlate.tools.exception('cannot use operation "after" on attributes');
        }
        for (var k=0; k<this.length; k++) {
            var node = this[k];
            var childNodes = node.parentNode.childNodes;
            var index = childNodes.indexOf(node);
            var args = Collection.cloneNode(true);
            args.unshift(index+1, 0);
            childNodes.splice.apply(childNodes, args);
        }
        makeParentAndDescendant(this[0].root());
    };
    Collection.prototype.cloneNode = function (deep) {
        var result = new Collection();
        for (var u=0; u<this.length; u++) {
            result.push(deep ? this[u].cloneNode(true) : this[u]);
        }
        return result;
    };
    Collection.prototype.root = function () {
        return this[0].root();
    };

    // add Node method to Collection
    function addCollectionMethod (methodName) {
        var method = Node.prototype[methodName];
        Collection.prototype[methodName] = function () {
            var result = new Collection();
            if (!this.length) {
                return result;
            }
            var args = Array.prototype.slice.apply(arguments);
            for (var i=0; i<this.length; i++) {
                var value = method.apply(this[i], args);
                if (value instanceof Collection) {
                    result.push.apply(result, value);
                } else {
                    result.push(value);
                }
            }
            return result;
        }
    }
    for (var methodName in Node.prototype) {
        if (methodName.slice(0, 6) === '_xpath') {
            addCollectionMethod(methodName);
        }
    }

    // filter
    Collection.prototype._getSublistOf = function (node) {
        if (this.group) {
            return this;
        }
        var sublist = [];
        var childNodes = node.parentNode.childNodes;
        for (var u=0; u<childNodes.length; u++) {
            if (this.indexOf(childNodes[u]) !== -1) {
                sublist.push(childNodes[u]);
            }
        }
        return sublist;
    };
    Collection.prototype._xpathFilter = function (callback) {
        var result = new Collection();
        var node;
        for (var k=0; k<this.length; k++) {
            node = this[k];
            var res = callback(node);

            if (typeof res === 'number') {
                if (this.group) {
                    if (res === k) {
                        result.push(node);
                    }
                } else if (res === this._getSublistOf(node).indexOf(node)) {
                    result.push(node);
                }
            } else if (res && !(res instanceof Collection) || res.length) {
                result.push(node);
            }
        }
        return result;
    };
    // axe
    Collection.prototype._xpathAxe_root = function () {
        return this.root();
    };
    Collection.prototype['_xpathAxe_descendant-or-self'] = function () {
        var result = new Collection();
        for (var k=0; k<this.length; k++) {
            if (result.indexOf(this[u]) !== -1) {
                continue;
            }
            var value = this[k]['_xpathAxe_descendant-or-self']();
            for (var u=0; u<value.length; u++) {
                if (result.indexOf(value[u]) === -1) {
                    result.unshift(value[u]);
                }
            }
        }
        return result;
    };
    Collection.prototype._xpathAxe_parent = function () {
        var result = new Collection();
        for (var k=0; k<this.length; k++) {
            var parent = this[k].parentNode;
            if (result.indexOf(parent) === -1) {
                result.push(parent);
            }
        }
        return result;
    };
    Collection.prototype._xpathAxe_child = function () {
        return this;
    };
    // tagName
    Collection.prototype._xpathTagName = function (tagName) {
        var result = new Collection();
        for (var k=0; k<this.length; k++) {
            result.push.apply(result, this[k]._xpathTagName(tagName));
        }
        return result;
    };
    // attribute
    Collection.prototype._xpathAttribute = function (name) {
        var result = new Collection();
        for (var k=0; k<this.length; k++) {
            result.push.apply(result, this[k]._xpathAttribute(name));
        }
        return result;
    };
    // method
    Collection.prototype._xpathMethod_text = function () {
        var result = new Collection();
        for (var k=0; k<this.length; k++) {
            result.push.apply(result, this[k]._xpathMethod_text());
        }
        return result;
    };
    Collection.prototype._xpathMethod_comment = function () {
        var result = new Collection();
        for (var k=0; k<this.length; k++) {
            if (this[k].nodeType === 8) {
                result.push(this[k]);
            }
        }
        return result;
    };

    // END XPATH

    return parse;
})();

qPlate.Engine = (function() {
    function Engine() {
        this.prefix = 't';
        this.debug = false;
        this.templates = {};
        this.compiled_templates = {};
        this.extend_templates = {};
        this.default_dict = {};
        this.tools = qPlate.tools;
        this.reserved_words = qPlate.RESERVED_WORDS.slice(0);
        this.actions_precedence = qPlate.ACTIONS_PRECEDENCE.slice(0);
        this.void_elements = qPlate.VOID_ELEMENTS.slice(0);
        this.word_replacement = qPlate.tools.extend({}, qPlate.WORD_REPLACEMENT);
        this.preprocess_node = null;
    }
    qPlate.tools.extend(Engine.prototype, {
        /**
         * Add a template to the engine
         *
         * @param {String} template Template as string
         */
        addTemplate : function(template) {
            var arch = qPlate.tools.parse(template);

            var nodes = [];
            var ec = arch.childNodes;
            for (var i = 0; i < ec.length; i++) {
                if (ec[i].tagName === "templates") {
                    for (var u = 0; u < ec[i].childNodes.length; u++) {
                        if (ec[i].childNodes[u].nodeType === 1) {
                            nodes.push(ec[i].childNodes[u]);
                        }
                    }
                }
            }
            if (!nodes.length) {
                nodes = arch.childNodes;
            }

            for (var i = 0; i < nodes.length; i++) {
                var node = this._preprocess(nodes[i]);

                if (node.nodeType === 1) {
                    var name = node.attributes[this.prefix + '-name'];
                    name = name && name.content;
                    var extend = node.attributes[this.prefix + '-extend'];
                    extend = extend && extend.content;

                    if (name || extend) {
                        node.parentNode = false;
                    }

                    this.tools.deepFreeze(node);

                    if (name && extend) {
                        // Clone template and extend it
                        if (!this.templates[extend]) {
                            return this.tools.exception("Can't clone undefined template " + extend);
                        }
                        this.templates[name] = this.templates[extend].cloneNode(true);
                        extend = name;
                        name = undefined;
                    }
                    if (name) {
                        this.templates[name] = node;
                        this.compiled_templates[name] = null;
                    } else if (extend) {
                        delete(this.compiled_templates[extend]);
                        if (this.extend_templates[extend]) {
                            this.extend_templates[extend].push(node);
                        } else {
                            this.extend_templates[extend] = [node];
                        }
                    }
                }
            }

            this.tools.deepFreeze(arch);
            return arch;
        },
        hasTemplate : function(template) {
            return !!this.templates[template];
        },
        render : function(template, dict) {
            dict = dict || {};
            qPlate.tools.extend(dict, this.default_dict);
            /*if (this.debug && window['console'] !== undefined) {
                console.time("qPlate render template " + template);
            }*/
            var r = this._render(template, dict);
            /*if (this.debug && window['console'] !== undefined) {
                console.timeEnd("qPlate render template " + template);
            }*/
            return r;
        },
        //---------------------------------------------------------
        // PRIVATE
        //---------------------------------------------------------
        _preprocess: function(arch) {
            /**
             * _preprocess a template's document at load time.
             * This method is mostly used for template sanitization but could
             * also be overloaded for extended features such as translations, ...
             * Throws an exception if a template is invalid.
             *
             * @param {Document} doc Document containg the loaded templates
             * @return {Document} Returns the pre-processed/sanitized template
             */
            // Sanitize t-elif and t-else directives
            var tbranch = [];
            for (var i = 0; i < arch.descendant.length; i++) {
                var node = arch.descendant[i];
                var attr = node.attributes;
                if ((attr['t-elif'] && attr['t-elif'].content !== null) ||
                    (attr['t-else'] && attr['t-else'].content !== null)) {
                    tbranch.push(node);
                }
            }

            for (var i = 0, ilen = tbranch.length; i < ilen; i++) {
                var node = tbranch[i];
                var prev_elem = node.previousNode();
                var pattr = function(name) { return prev_elem.attributes[name] && prev_elem.attributes[name].content; }
                var nattr = function(name) { return +!!(node.attributes[name] && node.attributes[name].content); }
                if (prev_elem && (pattr('t-if') || pattr('t-elif'))) {
                    if (pattr('t-foreach')) {
                        return this.tools.exception("Error: t-if cannot stay at the same level as t-foreach when using t-elif or t-else");
                    }
                    if (['t-if', 't-elif', 't-else'].map(nattr).reduce(function(a, b) { return a + b; }) > 1) {
                        return this.tools.exception("Error: only one conditional branching directive is allowed per node");
                    }
                    // All text nodes between branch nodes are removed
                    var childNodes = node.parentNode.childNodes;
                    var text_node;
                    while ((text_node = node.previousSibling()) !== prev_elem) {
                        if (this.tools.trim(text_node.content)) {
                            return this.tools.exception("Error: text is not allowed between branching directives");
                        }
                        childNodes.splice(childNodes.indexOf(text_node), 1);
                    }
                } else {
                    return this.tools.exception("Error: t-elif and t-else directives must be preceded by a t-if or t-elif directive");
                }
            }

            return arch;
        },
        _compile : function(node) {
            var e = new qPlate.Element(this, node);
            var template = node.attributes[this.prefix + '-name'];
            template = template && template.content;
            var fn = e._compile();
            return  "   /* 'this' refers to qPlate.Engine instance */\n" +
                    "   var context = { engine : this, template : " + (this.tools.js_escape(template)) + " };\n" +
                    "   dict = dict || {};\n" +
                    "   dict['__template__'] = '" + template + "';\n" +
                    "   var r = [];\n" +
                    "   /* START TEMPLATE */" +
                    (this.debug ? "" : " try {\n") +
                    fn + "\n" +
                    "   /* END OF TEMPLATE */" +
                    (this.debug ? "" : " } catch(error) {\n" +
                    "       if (console && console.exception) console.exception(error);\n" +
                    "       context.engine.tools.exception('Runtime Error: ' + error, context);\n") +
                    (this.debug ? "" : "   }\n") +
                    "   return r.join('');";
        },
        _render : function(template, dict) {
            if (this.compiled_templates[template]) {
                return this.compiled_templates[template].apply(this, [dict || {}]);
            } else if (this.templates[template]) {
                var ext;
                if (ext = this.extend_templates[template]) {
                    var extend_node;
                    while (extend_node = ext.shift()) {
                        this.extend(template, extend_node);
                    }
                }
                var code = this._compile(this.templates[template]), tcompiled;
                try {
                    tcompiled = new Function(['dict'], code);
                } catch (error) {
                    if (this.debug && window.console) {
                        console.log(code);
                    }
                    this.tools.exception("Error evaluating template: " + error, { template: template });
                }
                if (!tcompiled) {
                    this.tools.exception("Error evaluating template: (IE?)" + error, { template: template });
                }
                this.compiled_templates[template] = tcompiled;
                return this.render(template, dict);
            } else {
                return this.tools.exception("Template '" + template + "' not found");
            }
        },
        extend : function(template, extend_node) {
            var template_dest = this.templates[template];

            for (var i = 0, ilen = extend_node.childNodes.length; i < ilen; i++) {
                var child = extend_node.childNodes[i];
                if (child.nodeType === 1) {
                    var xpath = child.attributes[this.prefix + '-xpath'],
                        operation = child.attributes[this.prefix + '-operation'],
                        target,
                        error_msg = "Error while extending template '" + template;

                    xpath = xpath && xpath.content;
                    operation = operation && operation.content;

                    if (xpath) {
                        target = template_dest.xpath(xpath);
                        if (!target.length && window.console) {
                            console.debug('Can\'t find "'+xpath+'" when extending template '+template);
                        }
                    } else {
                        this.tools.exception(error_msg + "No expression given");
                    }
                    error_msg += "' (expression='" + xpath + "') : ";
                    if (operation) {
                        var allowed_operations = "append,prepend,before,after,replace,inner".split(',');
                        if (this.tools.arrayIndexOf(allowed_operations, operation) == -1) {
                            this.tools.exception(error_msg + "Invalid operation : '" + operation + "'");
                        }
                        target[operation](child.childNodes);
                    } else {
                        try {
                            var f = new Function(['$', 'document'], child.innerHTML());
                        } catch(error) {
                            return this.tools.exception("Parse " + error_msg + error);
                        }
                        try {
                            f.apply(target, [jQuery, template_dest.ownerDocument]);
                        } catch(error) {
                            return this.tools.exception("Runtime " + error_msg + error);
                        }
                    }
                }
            }
        }
    });
    return Engine;
})();

qPlate.Element = (function() {
    var dynamicAtt = /^(?:#{(.+?)}|{{(.+?)}})$/;
    var dynamicAttf = /(?:#{(.+?)}|{{(.+?)}})/;

    function Element(engine, node) {
        this.engine = engine;
        this.node = node;
        this.tag = node.tagName;
        this.actions = {};
        this.actions_done = [];
        this.attributes = {};
        this.children = [];
        this._top = [];
        this._bottom = [];
        this._indent = 1;
        this.process_children = true;
        this.is_void_element = ~qPlate.tools.arrayIndexOf(this.engine.void_elements, this.tag);
        var childs = this.node.childNodes;
        if (childs) {
            for (var i = 0, ilen = childs.length; i < ilen; i++) {
                this.children.push(new qPlate.Element(this.engine, childs[i]));
            }
        }
        var attrs = this.node.attributes;
        for (var name in attrs) {
            var value = this.engine.tools.html_unescape(attrs[name].content);
            var m = name.match(new RegExp("^" + this.engine.prefix + "-(.+)"));
            if (m) {
                name = m[1];
                if (name === 'name') {
                    continue;
                }
                this.actions[name] = value;
            } else if (dynamicAtt.test(value)) {
                this.actions['att-' + name] = value.substr(2, value.length-4);
            } else if (dynamicAttf.test(value)) {
                this.actions['attf-' + name] = value;
            } else {
                this.attributes[name] = value;
            }
        }
        if (this.tag && this.tag.toLowerCase() !== this.engine.prefix) {
            this.actions.tag = true;
        }
        if (this.engine.preprocess_node) {
            this.engine.preprocess_node.call(this);
        }
    }

    qPlate.tools.extend(Element.prototype, {
        _compile : function() {
            var r = [],
                instring = false,
                lines = this.__compile().split('\n');
            for (var i = 0, ilen = lines.length; i < ilen; i++) {
                var m, line = lines[i];
                if (m = line.match(/^(\s*)\/\/@string=(.*)/)) {
                    if (instring) {
                        if (this.engine.debug) {
                            // Split string lines in indented r.push arguments
                            r.push((m[2].indexOf("\\n") != -1 ? "',\n\t" + m[1] + "'" : '') + m[2]);
                        } else {
                            r.push(m[2]);
                        }
                    } else {
                        r.push(m[1] + "r.push('" + m[2]);
                        instring = true;
                    }
                } else {
                    if (instring) {
                        r.push("');\n");
                    }
                    instring = false;
                    r.push(line + '\n');
                }
            }
            return r.join('');
        },
        __compile : function() {
            switch (this.node.nodeType) {
                case 3:
                case 4:
                    this.top_string(this.node.content);
                break;
                case 1:
                    this.compile_element();
            }
            var r = this._top.join('');
            if (this.process_children) {
                for (var i = 0, ilen = this.children.length; i < ilen; i++) {
                    var child = this.children[i];
                    child._indent = this._indent;
                    r += child.__compile();
                }
            }
            r += this._bottom.join('');
            return r;
        },
        format_expression : function(e) {
            /* Naive format expression builder. Replace reserved words and variables to dict[variable]
             * Does not handle spaces before dot yet, and causes problems for anonymous functions. Use t-js="" for that */
             if (qPlate.expressions_cache[e]) {
              return qPlate.expressions_cache[e];
            }
            var chars = e.split(''),
                instring = '',
                invar = '',
                invar_pos = 0,
                r = '';
            chars.push(' ');
            for (var i = 0, ilen = chars.length; i < ilen; i++) {
                var c = chars[i];
                if (instring.length) {
                    if (c === instring && chars[i - 1] !== "\\") {
                        instring = '';
                    }
                } else if (c === '"' || c === "'") {
                    instring = c;
                } else if (c.match(/[a-zA-Z_\$]/) && !invar.length) {
                    invar = c;
                    invar_pos = i;
                    continue;
                } else if (c.match(/\W/) && invar.length) {
                    // TODO: Should check for possible spaces before dot
                    if (chars[invar_pos - 1] !== '.' && qPlate.tools.arrayIndexOf(this.engine.reserved_words, invar) < 0) {
                        invar = this.engine.word_replacement[invar] || ("dict['" + invar + "']");
                    }
                    r += invar;
                    invar = '';
                } else if (invar.length) {
                    invar += c;
                    continue;
                }
                r += c;
            }
            r = r.slice(0, -1);
            qPlate.expressions_cache[e] = r;
            return r;
        },
        format_str: function (e) {
            if (e == '0') {
                return 'dict[0]';
            }
            return this.format_expression(e);
        },
        string_interpolation : function(s) {
            var _this = this;
            if (!s) {
              return "''";
            }
            function append_literal(s) {
                s && r.push(_this.engine.tools.js_escape(s));
            }

            var re = /(?:#{(.+?)}|{{(.+?)}})/g, start = 0, r = [], m;
            while (m = re.exec(s)) {
                // extract literal string between previous and current match
                append_literal(s.slice(start, re.lastIndex - m[0].length));
                // extract matched expression
                r.push('(' + this.format_str(m[2] || m[1]) + ')');
                // update position of new matching
                start = re.lastIndex;
            }
            // remaining text after last expression
            append_literal(s.slice(start));

            return r.join(' + ');
        },
        indent : function() {
            return this._indent++;
        },
        dedent : function() {
            if (this._indent !== 0) {
                return this._indent--;
            }
        },
        get_indent : function() {
            return new Array(this._indent + 1).join("\t");
        },
        top : function(s) {
            return this._top.push(this.get_indent() + s + '\n');
        },
        top_string : function(s) {
            return this._top.push(this.get_indent() + "//@string=" + this.engine.tools.js_escape(s, true) + '\n');
        },
        bottom : function(s) {
            return this._bottom.unshift(this.get_indent() + s + '\n');
        },
        bottom_string : function(s) {
            return this._bottom.unshift(this.get_indent() + "//@string=" + this.engine.tools.js_escape(s, true) + '\n');
        },
        compile_element : function() {
            for (var i = 0, ilen = this.engine.actions_precedence.length; i < ilen; i++) {
                var a = this.engine.actions_precedence[i];
                if (a in this.actions) {
                    var value = this.actions[a];
                    var key = 'compile_action_' + a;
                    if (this[key]) {
                        this[key](value);
                    } else if (this.engine[key]) {
                        this.engine[key].call(this, value);
                    } else {
                        this.engine.tools.exception("No handler method for action '" + a + "'");
                    }
                }
            }
        },
        compile_action_if : function(value) {
            this.top("if (" + (this.format_expression(value)) + ") {");
            this.bottom("}");
            this.indent();
        },
        compile_action_elif : function(value) {
            this.top("else if (" + (this.format_expression(value)) + ") {");
            this.bottom("}");
            this.indent();
        },
        compile_action_else : function(value) {
            this.top("else {");
            this.bottom("}");
            this.indent();
        },
        compile_action_foreach : function(value) {
            var as = this.actions['as'] || value.replace(/[^a-zA-Z0-9]/g, '_');
            //TODO: exception if t-as not valid
            this.top("context.engine.tools.foreach(context, " + (this.format_expression(value)) + ", " + (this.engine.tools.js_escape(as)) + ", dict, function(context, dict) {");
            this.bottom("});");
            this.indent();
        },
        compile_action_tag: function () {
            var tag = "<" + this.tag;
            for (var a in this.attributes) {
                tag += this.engine.tools.gen_attribute([a, this.attributes[a]]);
            }
            this.top_string(tag);
            if (this.actions.att) {
                this.top("r.push(context.engine.tools.gen_attribute(" + (this.format_expression(this.actions.att)) + "));");
            }
            for (var a in this.actions) {
                var v = this.actions[a];
                var m = a.match(/att-(.+)/);
                if (m) {
                    this.top("r.push(context.engine.tools.gen_attribute(['" + m[1] + "', (" + (this.format_expression(v)) + ")]));");
                }
                var m = a.match(/attf-(.+)/);
                if (m) {
                    this.top("r.push(context.engine.tools.gen_attribute(['" + m[1] + "', (" + (this.string_interpolation(v)) + ")]));");
                }
            }
            if (this.actions.opentag === 'true' || (!this.children.length && this.is_void_element)) {
                // We do not enforce empty content on void elements
                // because qPlate rendering is not necessarily html.
                this.top_string("/>");
            } else {
                this.top_string(">");
                this.bottom_string("</" + this.tag + ">");
            }
        },
        compile_action_call : function(value) {
            if (this.children.length === 0) {
                return this.top("r.push(context.engine.tools.call(context, " + (this.string_interpolation(value)) + ", dict));");
            } else {
                this.top("r.push(context.engine.tools.call(context, " + (this.string_interpolation(value)) + ", dict, null, function(context, dict) {");
                this.bottom("}));");
                this.indent();
                this.top("var r = [];");
                return this.bottom("return r.join('');");
            }
        },
        compile_action_set : function(value) {
            var variable = this.format_expression(value);
            if (this.actions['value']) {
                if (this.children.length) {
                    this.engine.tools.warning("@set with @value plus node chidren found. Children are ignored.");
                }
                this.top(variable + " = (" + (this.format_expression(this.actions['value'])) + ");");
                this.process_children = false;
            } else {
                if (this.children.length === 0) {
                    this.top(variable + " = '';");
                } else if (this.children.length === 1 && this.children[0].node.nodeType === 3) {
                    this.top(variable + " = " + (this.engine.tools.js_escape(this.children[0].node.content)) + ";");
                    this.process_children = false;
                } else {
                    this.top(variable + " = (function(dict) {");
                    this.bottom("})(dict);");
                    this.indent();
                    this.top("var r = [];");
                    this.bottom("return r.join('');");
                }
            }
        },
        compile_action_esc : function(value) {
            this.top("var cv = context.engine.tools.html_escape("
                    + (value === "0" ? "dict[0]" : this.format_expression(value))
                    + ");");
            this.top("if (!cv) {");
            this.bottom("} else { r.push(cv); }");
            this.indent();
        },
        compile_action_raw : function(value) {
            this.top("var cv = " + (this.format_str(value)) + ";");
            this.top("if (!cv) {");
            this.bottom("} else { r.push(cv); }");
            this.indent();
        },
        compile_action_js : function(value) {
            this.top("(function(" + value + ") {");
            this.bottom("})(dict);");
            this.indent();
            var lines = this.node.innerHTML().split(/\r?\n/);
            for (var i = 0, ilen = lines.length; i < ilen; i++) {
                this.top(lines[i]);
            }
            this.process_children = false;
        },
        compile_action_debug : function(value) {
            this.top("debugger;");
        },
        compile_action_log : function(value) {
            this.top("console.log(" + this.format_expression(value) + ");");
        }
    });
    return Element;
})();


if(typeof module.exports !== 'undefined') module.exports = qPlate;
return module.qPlate = qPlate;
})(typeof module === 'undefined' ? this : module);