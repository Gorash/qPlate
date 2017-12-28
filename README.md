<html>
  <body>
    <section id="qPlate">
        <h2>qPlate</h2>
        <i id="reference-qPlate"></i>
        <p>qPlate is the primary <a href="http://en.wikipedia.org/wiki/Template_processor" class="external reference">templating</a> engine. It is an XML templating engine and used mostly to generate <a href="http://en.wikipedia.org/wiki/HTML" class="external reference">HTML</a> fragments and pages. Can be used server side with nodejs or client side.</p>
        <p>Template directives are specified as XML attributes prefixed with <code>t-</code> by default (you can choose it), for instance <code>t-if</code> for <a href="#reference-qPlate-conditionals" class="internal reference"><span>conditionals</span></a>, with elements and other attributes being rendered directly.</p>
        <p>To avoid element rendering, a placeholder element <code>&lt;t&gt;</code> is also available, which executes its directive but doesn't generate any output in and of itself:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-if=</span><span class="s">"condition"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;p&gt;</span>Test<span class="nt">&lt;/p&gt;</span>
<span class="nt">&lt;/t&gt;</span>
</pre>
            </div>
        </div>
        <p>will result in:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;p&gt;</span>Test<span class="nt">&lt;/p&gt;</span>
</pre>
            </div>
        </div>
        <p>if <code>condition</code> is true, but:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div</span> <span class="na">t-if=</span><span class="s">"condition"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;p&gt;</span>Test<span class="nt">&lt;/p&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
        <p>will result in:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div&gt;</span>
    <span class="nt">&lt;p&gt;</span>Test<span class="nt">&lt;/p&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
    </section>
    <section id="data-output">
        <i id="reference-qPlate-output"></i>
        <h2>data output</h2>
        <p>qPlate has a primary output directive which automatically HTML-escape its
            content limiting <a href="http://en.wikipedia.org/wiki/Cross-site_scripting" class="external reference">XSS</a> risks when displaying user-provided content: <code>esc</code>.
        </p>
        <p><code>esc</code> takes an expression, evaluates it and prints the content:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;p&gt;&lt;t</span> <span class="na">t-esc=</span><span class="s">"value"</span><span class="nt">/&gt;&lt;/p&gt;</span>
</pre>
            </div>
        </div>
        <p>rendered with the value <code>value</code> set to <code>42</code> yields:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;p&gt;</span>42<span class="nt">&lt;/p&gt;</span>
</pre>
            </div>
        </div>
        <p>There is one other output directive <code>raw</code> which behaves the same as
            respectively <code>esc</code> but <em>does not HTML-escape its output</em>. It can be useful
            to display separately constructed markup (e.g. from functions) or already
            sanitized user-provided markup.
        </p>
    </section>
    <section id="conditionals">
        <i id="reference-qPlate-conditionals"></i>
        <h2>conditionals</h2>
        <p>qPlate has a conditional directive <code>if</code>, which evaluates an expression given
            as attribute value:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-if=</span><span class="s">"condition"</span><span class="nt">&gt;</span>
        <span class="nt">&lt;p&gt;</span>ok<span class="nt">&lt;/p&gt;</span>
    <span class="nt">&lt;/t&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
        <p>The element is rendered if the condition is true:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div&gt;</span>
    <span class="nt">&lt;p&gt;</span>ok<span class="nt">&lt;/p&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
        <p>but if the condition is false it is removed from the result:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
        <p>The conditional rendering applies to the bearer of the directive, which does
            not have to be <code>&lt;t&gt;</code>:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div&gt;</span>
    <span class="nt">&lt;p</span> <span class="na">t-if=</span><span class="s">"condition"</span><span class="nt">&gt;</span>ok<span class="nt">&lt;/p&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
        <p>will give the same results as the previous example.</p>
    </section>
    <section id="loops">
        <i id="reference-qPlate-loops"></i>
        <h2>loops</h2>
        <p>qPlate has an iteration directive <code>foreach</code> which take an expression returning
            the collection to iterate on, and a second parameter <code>t-as</code> providing the
            name to use for the "current item" of the iteration:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-foreach=</span><span class="s">"[1, 2, 3]"</span> <span class="na">t-as=</span><span class="s">"i"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;p&gt;&lt;t</span> <span class="na">t-esc=</span><span class="s">"i"</span><span class="nt">/&gt;&lt;/p&gt;</span>
<span class="nt">&lt;/t&gt;</span>
</pre>
            </div>
        </div>
        <p>will be rendered as:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;p&gt;</span>1<span class="nt">&lt;/p&gt;</span>
<span class="nt">&lt;p&gt;</span>2<span class="nt">&lt;/p&gt;</span>
<span class="nt">&lt;p&gt;</span>3<span class="nt">&lt;/p&gt;</span>
</pre>
            </div>
        </div>
        <p>Like conditions, <code>foreach</code> applies to the element bearing the directive's
            attribute, and
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;p</span> <span class="na">t-foreach=</span><span class="s">"[1, 2, 3]"</span> <span class="na">t-as=</span><span class="s">"i"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-esc=</span><span class="s">"i"</span><span class="nt">/&gt;</span>
<span class="nt">&lt;/p&gt;</span>
</pre>
            </div>
        </div>
        <p>is equivalent to the previous example.</p>
        <p><code>foreach</code> can iterate on an array (the current item will be the current
            value), a mapping (the current item will be the current key) or an integer
            (equivalent to iterating on an array between 0 inclusive and the provided
            integer exclusive).
        </p>
        <p>In addition to the name passed via <code>t-as</code>, <code>foreach</code> provides a few other
            variables for various data points:
        </p>
        <div role="alert" class="alert-warning alert">
            <p class="alert-title">Warning</p>
            <p><code>$as</code> will be replaced by the name passed to <code>t-as</code></p>
        </div>
        <dl>
            <dt><code class="samp"><em>$as</em>_all</code></dt>
            <dd>the object being iterated over</dd>
            <dt><code class="samp"><em>$as</em>_value</code></dt>
            <dd>the current iteration value, identical to <code>$as</code> for lists and integers,
                but for mappings it provides the value (where <code>$as</code> provides the key)
            </dd>
            <dt><code class="samp"><em>$as</em>_index</code></dt>
            <dd>the current iteration index (the first item of the iteration has index 0)</dd>
            <dt><code class="samp"><em>$as</em>_size</code></dt>
            <dd>the size of the collection if it is available</dd>
            <dt><code class="samp"><em>$as</em>_first</code></dt>
            <dd>whether the current item is the first of the iteration (equivalent to
                <code class="samp"><em>$as</em>_index == 0</code>)
            </dd>
            <dt><code class="samp"><em>$as</em>_last</code></dt>
            <dd>whether the current item is the last of the iteration (equivalent to
                <code class="samp"><em>$as</em>_index + 1 == <em>$as</em>_size</code>), requires the iteratee's size be
                available
            </dd>
            <dt><code class="samp"><em>$as</em>_parity</code></dt>
            <dd>either <code>"even"</code> or <code>"odd"</code>, the parity of the current iteration round</dd>
            <dt><code class="samp"><em>$as</em>_even</code></dt>
            <dd>a boolean flag indicating that the current iteration round is on an even
                index
            </dd>
            <dt><code class="samp"><em>$as</em>_odd</code></dt>
            <dd>a boolean flag indicating that the current iteration round is on an odd
                index
            </dd>
        </dl>
        <p>These extra variables provided and all new variables created into the
            <code>foreach</code> are only available in the scope of the``foreach``. If the
            variable exists outside the context of the <code>foreach</code>, the value is copied
            at the end of the foreach into the global context.
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"existing_variable"</span> <span class="na">t-value=</span><span class="s">"False"</span><span class="nt">/&gt;</span>
<span class="c">&lt;!-- existing_variable now False --&gt;</span>

<span class="nt">&lt;p</span> <span class="na">t-foreach=</span><span class="s">"[1, 2, 3]"</span> <span class="na">t-as=</span><span class="s">"i"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"existing_variable"</span> <span class="na">t-value=</span><span class="s">"True"</span><span class="nt">/&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"new_variable"</span> <span class="na">t-value=</span><span class="s">"True"</span><span class="nt">/&gt;</span>
    <span class="c">&lt;!-- existing_variable and new_variable now True --&gt;</span>
<span class="nt">&lt;/p&gt;</span>

<span class="c">&lt;!-- existing_variable always True --&gt;</span>
<span class="c">&lt;!-- new_variable undefined --&gt;</span>
</pre>
            </div>
        </div>
    </section>
    <section id="attributes">
        <i id="reference-qPlate-attributes"></i>
        <h2>attributes</h2>
        <p>qPlate can compute attributes on-the-fly and set the result of the computation
            on the output node. This is done via the <code>t-att</code> (attribute) directive which
            exists in 4 different forms:
        </p>
        <dl>
            <dt><code class="samp"><em>$name</em>="<em>{{</em>...<em>}}</em>"</code></dt>
            <dd>
                <p>an attribute called <code>$name</code> is created, the attribute value contains in the braces is evaluated and the result is set as the attribute's value:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">class=</span><span class="s">"static {{'add-class'}}"</span><span class="nt">/&gt;</span>
</pre>
                    </div>
                </div>
                <p>will be rendered as:</p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">class=</span><span class="s">"static add-class"</span><span class="nt">&gt;&lt;/div&gt;</span>
</pre>
                    </div>
                </div>
            </dd>
            <dt><code class="samp">t-att-<em>$name</em></code></dt>
            <dd>
                <p>an attribute called <code>$name</code> is created, the attribute value is evaluated
                    and the result is set as the attribute's value:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">t-att-a=</span><span class="s">"42"</span><span class="nt">/&gt;</span>
</pre>
                    </div>
                </div>
                <p>will be rendered as:</p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">a=</span><span class="s">"42"</span><span class="nt">&gt;&lt;/div&gt;</span>
</pre>
                    </div>
                </div>
            </dd>
            <dt><code class="samp">t-attf-<em>$name</em></code></dt>
            <dd>
                <p>same as previous, but the parameter is a <a href="../glossary.html#term-format-string" class="internal reference"><span class="std std-term xref">format string</span></a>
                    instead of just an expression, often useful to mix literal and non-literal
                    string (e.g. classes):
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-foreach=</span><span class="s">"[1, 2, 3]"</span> <span class="na">t-as=</span><span class="s">"item"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;li</span> <span class="na">t-attf-class=</span><span class="s">"row {{ item_parity }}"</span><span class="nt">&gt;&lt;t</span> <span class="na">t-esc=</span><span class="s">"item"</span><span class="nt">/&gt;&lt;/li&gt;</span>
<span class="nt">&lt;/t&gt;</span>
</pre>
                    </div>
                </div>
                <p>will be rendered as:</p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;li</span> <span class="na">class=</span><span class="s">"row even"</span><span class="nt">&gt;</span>1<span class="nt">&lt;/li&gt;</span>
<span class="nt">&lt;li</span> <span class="na">class=</span><span class="s">"row odd"</span><span class="nt">&gt;</span>2<span class="nt">&lt;/li&gt;</span>
<span class="nt">&lt;li</span> <span class="na">class=</span><span class="s">"row even"</span><span class="nt">&gt;</span>3<span class="nt">&lt;/li&gt;</span>
</pre>
                    </div>
                </div>
            </dd>
            <dt><code class="samp">t-att=mapping</code></dt>
            <dd>
                <p>if the parameter is a mapping, each (key, value) pair generates a new
                    attribute and its value:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">t-att=</span><span class="s">"{'a': 1, 'b': 2}"</span><span class="nt">/&gt;</span>
</pre>
                    </div>
                </div>
                <p>will be rendered as:</p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">a=</span><span class="s">"1"</span> <span class="na">b=</span><span class="s">"2"</span><span class="nt">&gt;&lt;/div&gt;</span>
</pre>
                    </div>
                </div>
            </dd>
            <dt><code class="samp">t-att=pair</code></dt>
            <dd>
                <p>if the parameter is a pair (tuple or array of 2 element), the first
                    item of the pair is the name of the attribute and the second item is the
                    value:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">t-att=</span><span class="s">"['a', 'b']"</span><span class="nt">/&gt;</span>
</pre>
                    </div>
                </div>
                <p>will be rendered as:</p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;div</span> <span class="na">a=</span><span class="s">"b"</span><span class="nt">&gt;&lt;/div&gt;</span>
</pre>
                    </div>
                </div>
            </dd>
        </dl>
    </section>
    <section id="setting-variables">
        <h2>setting variables</h2>
        <p>qPlate allows creating variables from within the template, to memoize a
            computation (to use it multiple times), give a piece of data a clearer name,
            ...
        </p>
        <p>This is done via the <code>set</code> directive, which takes the name of the variable
            to create. The value to set can be provided in two ways:
        </p>
        <ul>
            <li>
                <p>a <code>t-value</code> attribute containing an expression, and the result of its
                    evaluation will be set:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"foo"</span> <span class="na">t-value=</span><span class="s">"2 + 1"</span><span class="nt">/&gt;</span>
<span class="nt">&lt;t</span> <span class="na">t-esc=</span><span class="s">"foo"</span><span class="nt">/&gt;</span>
</pre>
                    </div>
                </div>
                <p>will print <code>3</code></p>
            </li>
            <li>
                <p>if there is no <code>t-value</code> attribute, the node's body is rendered and set
                    as the variable's value:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"foo"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;li&gt;</span>ok<span class="nt">&lt;/li&gt;</span>
<span class="nt">&lt;/t&gt;</span>
<span class="nt">&lt;t</span> <span class="na">t-esc=</span><span class="s">"foo"</span><span class="nt">/&gt;</span>
</pre>
                    </div>
                </div>
                <p>will generate <code>&amp;lt;li&amp;gt;ok&amp;lt;/li&amp;gt;</code> (the content is escaped as we
                    used the <code>esc</code> directive)
                </p>
                <div role="alert" class="alert-info alert">
                    <p class="alert-title">Note</p>
                    <p>using the result of this operation is a significant use-case for
                        the <code>raw</code> directive.
                    </p>
                </div>
            </li>
        </ul>
    </section>
    <section id="calling-sub-templates">
        <h2>calling sub-templates</h2>
        <p>qPlate templates can be used for top-level rendering, but they can also be used
            from within another template (to avoid duplication or give names to parts of
            templates) using the <code>t-call</code> directive:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-call=</span><span class="s">"other-template"</span><span class="nt">/&gt;</span>
</pre>
            </div>
        </div>
        <p>This calls the named template with the execution context of the parent, if
            <code>other_template</code> is defined as:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;p&gt;&lt;t</span> <span class="na">t-value=</span><span class="s">"var"</span><span class="nt">/&gt;&lt;/p&gt;</span>
</pre>
            </div>
        </div>
        <p>the call above will be rendered as <code>&lt;p/&gt;</code> (no content), but:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"var"</span> <span class="na">t-value=</span><span class="s">"1"</span><span class="nt">/&gt;</span>
<span class="nt">&lt;t</span> <span class="na">t-call=</span><span class="s">"other-template"</span><span class="nt">/&gt;</span>
</pre>
            </div>
        </div>
        <p>will be rendered as <code>&lt;p&gt;1&lt;/p&gt;</code>.</p>
        <p>However this has the problem of being visible from outside the <code>t-call</code>.
            Alternatively, content set in the body of the <code>call</code> directive will be
            evaluated <em>before</em> calling the sub-template, and can alter a local context:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-call=</span><span class="s">"other-template"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"var"</span> <span class="na">t-value=</span><span class="s">"1"</span><span class="nt">/&gt;</span>
<span class="nt">&lt;/t&gt;</span>
<span class="c">&lt;!-- "var" does not exist here --&gt;</span>
</pre>
            </div>
        </div>
        <p>The body of the <code>call</code> directive can be arbitrarily complex (not just
            <code>set</code> directives), and its rendered form will be available within the called
            template as a magical <code>0</code> variable:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div&gt;</span>
    This template was called with content:
    <span class="nt">&lt;t</span> <span class="na">t-raw=</span><span class="s">"0"</span><span class="nt">/&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
        <p>being called thus:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-call=</span><span class="s">"other-template"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;em&gt;</span>content<span class="nt">&lt;/em&gt;</span>
<span class="nt">&lt;/t&gt;</span>
</pre>
            </div>
        </div>
        <p>will result in:</p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;div&gt;</span>
    This template was called with content:
    <span class="nt">&lt;em&gt;</span>content<span class="nt">&lt;/em&gt;</span>
<span class="nt">&lt;/div&gt;</span>
</pre>
            </div>
        </div>
    </section>
    <section id="template-inheritance">
        <h4>template inheritance</h4>
        <p>Template inheritance is used to alter existing templates in-place, e.g. to add information to templates created by an other modules.
        </p>
        <p>Template inheritance is performed via the <code>t-extend</code> directive which takes the name of the template to alter as parameter.
        </p>
        <p>The alteration is then performed with any number of <code>t-xpath</code> sub-directives:
        </p>
        <div class="highlight-xml">
            <div class="highlight">
                <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-extend=</span><span class="s">"base.template"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-xpath=</span><span class="s">"//ul"</span> <span class="na">t-operation=</span><span class="s">"append"</span><span class="nt">&gt;</span>
        <span class="nt">&lt;li&gt;</span>new element<span class="nt">&lt;/li&gt;</span>
    <span class="nt">&lt;/t&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-xpath=</span><span class="s">"//ul/li/@name"</span> <span class="na">t-operation=</span><span class="s">"replace"</span><span class="nt">&gt;</span><span class="nt">attribute value<span class="nt">&lt;/t&gt;</span>
<span class="nt">&lt;/t&gt;</span>
</pre>
            </div>
        </div>
        <p>The <code>t-xpath</code> directives takes a <a href="#XPath" class="internal reference">Xpath selector</a>. This selector is used on the extended template to select <em>context nodes</em> to which the specified <code>t-operation</code> is applied:
        </p>
        <dl>
            <dt><code>append</code></dt>
            <dd>the node's body is appended at the end of the context node (after the
                context node's last child)
            </dd>
            <dt><code>prepend</code></dt>
            <dd>the node's body is prepended to the context node (inserted before the
                context node's first child)
            </dd>
            <dt><code>replace</code></dt>
            <dd>the node's body is used to replace the context node itself</dd>
            <dt><code>before</code></dt>
            <dd>the node's body is inserted right before the context node (not available when target an attribute)</dd>
            <dt><code>after</code></dt>
            <dd>the node's body is inserted right after the context node (not available when target an attribute)</dd>
            <dt><code>inner</code></dt>
            <dd>the node's body replaces the context node's children (not available when target an attribute)</dd>
            <dt>No operation</dt>
            <dd>
                <p>if no <code>t-operation</code> is specified, the template body is interpreted as
                    javascript code and executed with the context node as <code>this</code>
                </p>
                <div role="alert" class="alert-warning alert">
                    <p class="alert-title">Warning</p>
                    <p>while much more powerful than other operations, this mode is
                        also much harder to debug and maintain, it is recommended to
                        avoid it
                    </p>
                </div>
            </dd>
        </dl>
    </section>
    <section id="id4">
        <h3>debugging</h3>
        <p>The javascript qPlate implementation provides a few debugging hooks:</p>
        <dl>
            <dt><code>t-log</code></dt>
            <dd>
                <p>takes an expression parameter, evaluates the expression during rendering
                    and logs its result with <code>console.log</code>:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"foo"</span> <span class="na">t-value=</span><span class="s">"42"</span><span class="nt">/&gt;</span>
<span class="nt">&lt;t</span> <span class="na">t-log=</span><span class="s">"foo"</span><span class="nt">/&gt;</span>
</pre>
                    </div>
                </div>
                <p>will print <code>42</code> to the console</p>
            </dd>
            <dt><code>t-debug</code></dt>
            <dd>
                <p>triggers a debugger breakpoint during template rendering:</p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-if=</span><span class="s">"a_test"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;t</span> <span class="na">t-debug=</span><span class="s">""</span><span class="nt">&gt;</span>
<span class="nt">&lt;/t&gt;</span>
</pre>
                    </div>
                </div>
                <p>will stop execution if debugging is active (exact condition depend on the
                    browser and its development tools)
                </p>
            </dd>
            <dt><code>t-js</code></dt>
            <dd>
                <p>the node's body is javascript code executed during template rendering.
                    Takes a <code>context</code> parameter, which is the name under which the rendering
                    context will be available in the <code>t-js</code>'s body:
                </p>
                <div class="highlight-xml">
                    <div class="highlight">
                        <pre><span></span><span class="nt">&lt;t</span> <span class="na">t-set=</span><span class="s">"foo"</span> <span class="na">t-value=</span><span class="s">"42"</span><span class="nt">/&gt;</span>
<span class="nt">&lt;t</span> <span class="na">t-js=</span><span class="s">"ctx"</span><span class="nt">&gt;</span>
    console.log("Foo is", ctx.foo);
<span class="nt">&lt;/t&gt;</span>
</pre>
                    </div>
                </div>
            </dd>
        </dl>
    </section>
    <section id="XPath">
      <h2>XPath</h2>
      <small>See also http://jean-luc.massat.perso.luminy.univ-amu.fr/ens/xml/04-xpath.html</small>
      <div>
        <table>
          <tbody>
            <tr>
              <th>Expression</th>
              <th>Refers to</th>
            </tr>
            <tr>
              <td>
                <p>
                  <code>./author</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements within the current context. Note that this is equivalent to the expression in the next row.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements within the current context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>first.name</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;first.name&gt;</code> elements within the current context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>/bookstore</code>
                </p>
              </td>
              <td>
                <p>The document element (<code>&lt;bookstore&gt;</code>) of this document.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>//author</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements in the document.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book[/bookstore/@specialty=@style]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;book&gt;</code> elements whose <code>style</code> attribute value is equal to the <code>specialty</code> attribute value of the <code>&lt;bookstore&gt;</code> element at the root of the document.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author/first-name</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;first-name&gt;</code> elements that are children of an <code>&lt;author&gt;</code> element.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>bookstore//title</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;title&gt;</code> elements one or more levels deep in the <code>&lt;bookstore&gt;</code> element (arbitrary descendants). Note that this is different from the expression in the next row.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>bookstore/\*/title</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;title&gt;</code> elements that are grandchildren of <code>&lt;bookstore&gt;</code> elements.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>bookstore//book/excerpt//emph</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;emph&gt;</code> elements anywhere inside <code>&lt;excerpt&gt;</code> children of <code>&lt;book&gt;</code> elements, anywhere inside the <code>&lt;bookstore&gt;</code> element.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>.//title</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;title&gt;</code> elements one or more levels deep in the current context. Note that this situation is essentially the only one in which the period notation is required.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author/\*</code>
                </p>
              </td>
              <td>
                <p>All elements that are the children of <code>&lt;author&gt;</code> elements.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book/\*/last-name</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;last-name&gt;</code> elements that are grandchildren of <code>&lt;book&gt;</code> elements.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>\*/\*</code>
                </p>
              </td>
              <td>
                <p>All grandchildren elements of the current context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>\*[@specialty]</code>
                </p>
              </td>
              <td>
                <p>All elements with the <code>specialty</code> attribute.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>@style</code>
                </p>
              </td>
              <td>
                <p>The <code>style</code> attribute of the current context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>price/@exchange</code>
                </p>
              </td>
              <td>
                <p>The <code>exchange</code> attribute on <code>&lt;price&gt;</code> elements within the current context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>price/@exchange/total</code>
                </p>
              </td>
              <td>
                <p>Returns an empty node set, because attributes do not contain element children. This expression is allowed by the XML Path Language (XPath) grammar, but is not strictly valid.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book[@style]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;book&gt;</code> elements with <code>style</code> attributes, of the current context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book/@style</code>
                </p>
              </td>
              <td>
                <p>The <code>style</code> attribute for all <code>&lt;book&gt;</code> elements of the current context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>@\*</code>
                </p>
              </td>
              <td>
                <p>All attributes of the current element context.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>./first-name</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;first-name&gt;</code> elements in the current context node. Note that this is equivalent to the expression in the next row.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>first-name</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;first-name&gt;</code> elements in the current context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[1]</code>
                </p>
              </td>
              <td>
                <p>The first <code>&lt;author&gt;</code> element in the current context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[first-name][3]</code>
                </p>
              </td>
              <td>
                <p>The third <code>&lt;author&gt;</code> element that has a <code>&lt;first-name&gt;</code> child.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>my:book</code>
                </p>
              </td>
              <td>
                <p>The <code>&lt;book&gt;</code> element from the <code>my</code> namespace.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>my:\*</code>
                </p>
              </td>
              <td>
                <p>All elements from the <code>my</code> namespace.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>@my:\*</code>
                </p>
              </td>
              <td>
                <p>All attributes from the <code>my</code> namespace (this does not include unqualified attributes on elements from the <code>my</code> namespace).</p>
              </td>
            </tr>
            <tr><td colspan="2"><h3>------------</h3></td></tr>
            <tr>
              <td>
                <p>
                  <code>x/y[1]</code>
                </p>
              </td>
              <td>
                <p>The first <code>&lt;y&gt;</code> child of each <code>&lt;x&gt;</code>. This is equivalent to the expression in the next row.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>x/y[position() = 1]</code>
                </p>
              </td>
              <td>
                <p>The first <code>&lt;y&gt;</code> child of each <code>&lt;x&gt;</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>(x/y)[1]</code>
                </p>
              </td>
              <td>
                <p>The first <code>&lt;y&gt;</code> from the entire set of <code>&lt;y&gt;</code> children of <code>&lt;x&gt;</code> elements.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>x[1]/y[2]</code>
                </p>
              </td>
              <td>
                <p>The second <code>&lt;y&gt;</code> child of the first <code>&lt;x&gt;</code>.</p>
              </td>
            </tr>
            <tr><td colspan="2"><h3>------------</h3></td></tr>
            <tr>
              <td>
                <p>
                  <code>book[last()]</code>
                </p>
              </td>
              <td>
                <p>The last <code>&lt;book&gt;</code> element of the current context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book/author[last()]</code>
                </p>
              </td>
              <td>
                <p>The last <code>&lt;author&gt;</code> child of each <code>&lt;book&gt;</code> element of the current context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>(book/author)[last()]</code>
                </p>
              </td>
              <td>
                <p>The last <code>&lt;author&gt;</code> element from the entire set of <code>&lt;author&gt;</code> children of <code>&lt;book&gt;</code> elements of the current context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book[excerpt]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;book&gt;</code> elements that contain at least one <code>&lt;excerpt&gt;</code> element child.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book[excerpt]/title</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;title&gt;</code> elements that are children of <code>&lt;book&gt;</code> elements that also contain at least one <code>&lt;excerpt&gt;</code> element child.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book[excerpt]/author[degree]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain at least one <code>&lt;degree&gt;</code> element child, and that are children of <code>&lt;book&gt;</code> elements that also contain at least one <code>&lt;excerpt&gt;</code> element. </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book[author/degree]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;book&gt;</code> elements that contain <code>&lt;author&gt;</code> children that in turn contain at least one <code>&lt;degree&gt;</code> child.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[degree][award]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain at least one <code>&lt;degree&gt;</code> element child and at least one <code>&lt;award&gt;</code> element child.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[degree and award]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain at least one <code>&lt;degree&gt;</code> element child and at least one <code>&lt;award&gt;</code> element child.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[(degree or award) and publication]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain at least one <code>&lt;degree&gt;</code> or <code>&lt;award&gt;</code> and at least one <code>&lt;publication&gt;</code> as the children</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[degree and not(publication)]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain at least one <code>&lt;degree&gt;</code> element child and that contain no <code>&lt;publication&gt;</code> element children.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[not(degree or award) and publication]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain at least one <code>&lt;publication&gt;</code> element child and contain neither <code>&lt;degree&gt;</code> nor <code>&lt;award&gt;</code> element children.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[last-name = "Bob"]             </code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain at least one <code>&lt;last-name&gt;</code> element child with the value <code>Bob</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[last-name[1] = "Bob"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements where the first <code>&lt;last-name&gt;</code> child element has the value <code>Bob</code>. Note that this is equivalent to the expression in the next row.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[last-name [position()=1]= "Bob"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements where the first <code>&lt;last-name&gt;</code> child element has the value <code>Bob</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>degree[@from != "Harvard"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;degree&gt;</code> elements where the <code>from</code> attribute is not equal to <code>"Harvard"</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>degree[@from %= "Har%"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;degree&gt;</code> elements where the <code>from</code> attribute begin by <code>"Har"</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>degree[@from \*= "arva"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;degree&gt;</code> elements where the <code>from</code> attribute contains <code>"arva"</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>degree[@from ?= "[Aar]+.a"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;degree&gt;</code> elements where the <code>from</code> attribute match as regular expression <code>"[Aar]+.a"</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[. = "Matthew Bob"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements whose value is <code>Matthew Bob</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[last-name = "Bob" and ../price &amp;gt; 50]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that contain a <code>&lt;last-name&gt;</code> child element whose value is <code>Bob</code>, and a <code>&lt;price&gt;</code> sibling element whose value is greater than 50. </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>book[position() &amp;lt;= 3]</code>
                </p>
              </td>
              <td>
                <p>The first three books (1, 2, 3).</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[not(last-name = "Bob")]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that do no contain <code>&lt;last-name&gt;</code> child elements with the value <code>Bob</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[first-name = "Bob"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that have at least one <code>&lt;first-name&gt;</code> child with the value <code>Bob</code>. </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[\* = "Bob"]</code>
                </p>
              </td>
              <td>
                <p>all author elements containing any child element whose value is <code>Bob</code>. </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>author[last-name = "Bob" and first-name = "Joe"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;author&gt;</code> elements that has a <code>&lt;last-name&gt;</code> child element with the value <code>Bob</code> and a <code>&lt;first-name&gt;</code> child element with the value <code>Joe</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>price[@intl = "Canada"]</code>
                </p>
              </td>
              <td>
                <p>All <code>&lt;price&gt;</code> elements in the context node which have an <code>intl</code> attribute equal to <code>"Canada"</code>.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>degree[position() &amp;lt; 3]</code>
                </p>
              </td>
              <td>
                <p>The first two <code>&lt;degree&gt;</code> elements that are children of the context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>p/text()[2]</code>
                </p>
              </td>
              <td>
                <p>The second text node in each <code>&lt;p&gt;</code> element in the context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>ancestor::book[1]</code>
                </p>
              </td>
              <td>
                <p>The nearest <code>&lt;book&gt;</code> ancestor of the context node.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>ancestor::book[author][1]</code>
                </p>
              </td>
              <td>
                <p>The nearest <code>&lt;book&gt;</code> ancestor of the context node and this <code>&lt;book&gt;</code> element has an <code>&lt;author&gt;</code> element as its child.</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  <code>ancestor::author[parent::book][1]</code>
                </p>
              </td>
              <td>
                <p>The nearest <code>&lt;author&gt;</code> ancestor in the current context and this <code>&lt;author&gt;</code> element is a child of a <code>&lt;book&gt;</code> element.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </body>
</html>
