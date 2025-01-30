import hmac
import json
import time
import requests
import hashlib


def shop_auth():
    timest = int(time.time())
    host = "https://partner.test-stable.shopeemobile.com"
    path = "/api/v2/shop/auth_partner"
    redirect_url = "www.google.com/"
    partner_id = 1258585
    tmp = "7a787157714f5474777075636873585a694169655457634d4e67584e67616271"
    partner_key = tmp.encode()
    tmp_base_string = "%s%s%s" % (partner_id, path, timest)
    print(partner_id, tmp_base_string)
    base_string = tmp_base_string.encode()
    sign = hmac.new(partner_key, base_string, hashlib.sha256).hexdigest()
    ##generate api
    url = host + path + "?partner_id=%s&timestamp=%s&sign=%s&redirect=%s" % (partner_id, timest, sign, redirect_url)
    print(url)

shop_auth()