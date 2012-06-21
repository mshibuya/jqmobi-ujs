require 'sinatra'
require 'json'

JQMOBI_VERSIONS = %w[ cdn ].freeze

use Rack::Static, :urls => ["/src"], :root => File.expand_path('..', settings.root)

helpers do
  def jqmobi_link version
    if params[:version] == version
      "[#{version}]"
    else
      "<a href='/?version=#{version}'>#{version}</a>"
    end
  end

  def jqmobi_src
    if params[:version] == 'edge'
      "/vendor/jq.mobi.js"
    else
      "http://cdn.jqmobi.com/jq.mobi.min.js"
    end
  end

  def test *names
    names = ["/vendor/qunit.js", "settings"] + names
    names.map { |name| script_tag name }.join("\n")
  end

  def script_tag src
    src = "/test/#{src}.js" unless src.index('/')
    %(<script src="#{src}" type="text/javascript"></script>)
  end

  def jqmobi_versions
    JQMOBI_VERSIONS
  end
end

get '/' do
  params[:version] ||= 'cdn'
  erb :index
end

[:get, :post, :put, :delete].each do |method|
  send(method, '/echo') {
    data = { :params => params }.update(request.env)

    if request.xhr?
      content_type 'application/json'
      data.to_json
    elsif params[:iframe]
      payload = data.to_json.gsub('<', '&lt;').gsub('>', '&gt;')
      <<-HTML
        <script>
          if (window.top && window.top !== window)
            window.top.jq('form,a').trigger('iframe:loaded', #{payload})
        </script>
        <p>You shouldn't be seeing this. <a href="#{request.env['HTTP_REFERER']}">Go back</a></p>
      HTML
    else
      content_type 'text/plain'
      status 400
      "ERROR: #{request.path} requested without ajax"
    end
  }
end

get '/error' do
  status 403
end
