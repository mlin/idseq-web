module IdSeqPipeline
  AWS_ACCESS_KEY_ID = ENV['AWS_ACCESS_KEY_ID']
  AWS_SECRET_ACCESS_KEY = ENV['AWS_SECRET_ACCESS_KEY']
  AWS_DEFAULT_REGION = ENV['AWS_DEFAULT_REGION']
  S3_SCRIPT_LOC = ENV['IDSEQ_S3_SCRIPT_LOC']
  BASE_COMMAND  = "export AWS_ACCESS_KEY_ID=#{AWS_ACCESS_KEY_ID}" \
                 " AWS_SECRET_ACCESS_KEY=#{AWS_SECRET_ACCESS_KEY}" \
                 " AWS_DEFAULT_REGION=#{AWS_DEFAULT_REGION}; ".freeze
end