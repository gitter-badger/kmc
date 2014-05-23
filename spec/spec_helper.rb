require 'bundler/setup'
Bundler.setup

require 'kosmos'

require 'webmock/rspec'
require 'fileutils'
require 'fakefs/safe'

module FakeFS
  class File
    def self.absolute_path(file_name, dir_name = Dir.getwd)
      RealFile.absolute_path(file_name, dir_name)
    end
  end
end

RSpec.configure do |config|
  config.color_enabled = true
end
